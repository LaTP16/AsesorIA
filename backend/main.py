import os
import csv
import time
from datetime import datetime
from typing import List, Optional, Literal, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
from google import genai

# Importar funciones de inferencia
from predecir_oferta import predecir_oferta
from generar_explicacion import generar_explicacion

load_dotenv()

app = FastAPI(
    title="Movistar IQ - API Backend",
    description="API para la herramienta interna de asesores comerciales Movistar (Cola de Prioridad, Panorama General, Inferencia y Copiloto IA)",
    version="1.3.0"
)

# Habilitar CORS para frontend Next.js (http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
ARCHIVO_INTERACCIONES = os.path.join(DATA_DIR, "interacciones_registradas.csv")
ARCHIVO_COLA = os.path.join(DATA_DIR, "cola_prioridad.csv")
ARCHIVO_OFERTAS = os.path.join(DATA_DIR, "catalogo_ofertas_limpio.csv")
ARCHIVO_CLIENTES = os.path.join(DATA_DIR, "dataset_clientes_con_variables.csv")

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR, exist_ok=True)

if not os.path.exists(ARCHIVO_INTERACCIONES):
    with open(ARCHIVO_INTERACCIONES, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'cliente_id', 'oferta_id', 'resultado', 'fecha_hora', 'notas_asesor'])


class InteraccionInput(BaseModel):
    cliente_id: str = Field(..., example="CLI000042")
    oferta_id: str = Field(..., example="OF001")
    resultado: Literal['mostrada', 'aceptada', 'rechazada'] = Field(..., example="aceptada")
    notas_asesor: Optional[str] = Field(None, example="Cliente aceptó migración promocional")


class ChatMessage(BaseModel):
    role: str = Field(..., example="user")
    content: str = Field(..., example="¿Cómo le respondo si me dice que está caro?")


class ChatAsesorInput(BaseModel):
    cliente_id: str = Field(..., example="CLI002483")
    oferta_id: Optional[str] = Field(None, example="OF001")
    mensaje_usuario: str = Field(..., example="¿Por qué este cliente tiene riesgo de fuga?")
    historial_mensajes: Optional[List[ChatMessage]] = Field(default=[])


@app.get("/")
def read_root():
    return {
        "app": "Movistar IQ Backend API",
        "status": "online",
        "endpoints": [
            "GET /cola-prioridad",
            "GET /panorama-general",
            "GET /panorama-general/campana/{campana_id}",
            "GET /cliente/{cliente_id}",
            "POST /registrar-interaccion",
            "POST /chat-asesor"
        ]
    }


# 1. GET /cola-prioridad
@app.get("/cola-prioridad")
def get_cola_prioridad(limit: Optional[int] = Query(100, description="Número de clientes a retornar")):
    try:
        if not os.path.exists(ARCHIVO_COLA):
            raise HTTPException(status_code=500, detail="Archivo 'data/cola_prioridad.csv' no encontrado.")

        df_cola = pd.read_csv(ARCHIVO_COLA)
        if limit and limit > 0:
            df_cola = df_cola.head(limit)

        resultado = []
        for _, row in df_cola.iterrows():
            c_id = str(row['cliente_id'])
            num_clean = c_id.replace('CLI', '').lstrip('0')
            nombre_disp = f"Cliente #{num_clean.zfill(3)}"

            resultado.append({
                "cliente_id": c_id,
                "nombre_display": nombre_disp,
                "prioridad": str(row['prioridad']).lower(),
                "motivo_prioridad": str(row['motivo_prioridad']),
                "score_aceptacion": float(round(row['score_aceptacion'], 2)),
                "riesgo_churn": str(row['riesgo']).lower()
            })

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener cola: {str(e)}")


# 2. GET /panorama-general
@app.get("/panorama-general")
def get_panorama_general():
    """
    Retorna métricas resumidas a nivel de parque y los totales por campaña comercial.
    """
    try:
        if not os.path.exists(ARCHIVO_CLIENTES) or not os.path.exists(ARCHIVO_COLA):
            raise HTTPException(status_code=500, detail="Archivos de datos no encontrados en backend/data/")

        df_cli = pd.read_csv(ARCHIVO_CLIENTES)
        df_cola = pd.read_csv(ARCHIVO_COLA)

        total_clientes = int(len(df_cli))
        oportunidad_mt_cnt = int((df_cli['brecha_mt'] == True).sum())
        cross_sell_cnt = int((df_cli['gap_hogar_movil'] == True).sum())
        riesgo_alto_cnt = int((df_cola['riesgo'] == 'alto').sum())

        fatiga_present = bool('fatiga_oferta' in df_cli.columns)
        if fatiga_present:
            retencion_cnt = int(((df_cola['riesgo'] == 'alto') | (df_cli['fatiga_oferta'] == True)).sum())
        else:
            retencion_cnt = riesgo_alto_cnt

        return {
            "resumen": {
                "total_clientes": total_clientes,
                "oportunidad_mt": oportunidad_mt_cnt,
                "cross_sell_disponible": cross_sell_cnt,
                "riesgo_alto": riesgo_alto_cnt
            },
            "campanas": [
                {
                    "id": "brecha_mt",
                    "nombre": "Oportunidad Movistar Total",
                    "descripcion": "Clientes elegibles que nunca aceptaron MT",
                    "total": oportunidad_mt_cnt
                },
                {
                    "id": "cross_sell",
                    "nombre": "Cross-sell Hogar/Móvil",
                    "descripcion": "Clientes con solo uno de los dos servicios",
                    "total": cross_sell_cnt
                },
                {
                    "id": "retencion",
                    "nombre": "Riesgo de Fuga",
                    "descripcion": "Riesgo alto o fatiga de oferta sin conversión",
                    "total": retencion_cnt
                }
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando panorama general: {str(e)}")


# 3. GET /panorama-general/campana/{campana_id}
@app.get("/panorama-general/campana/{campana_id}")
def get_campana_detalle(
    campana_id: str = Path(..., description="ID de la campaña: brecha_mt, cross_sell, retencion"),
    limit: Optional[int] = Query(100, description="Número máximo de clientes a retornar")
):
    """
    Devuelve la lista de clientes priorizados para una campaña específica,
    ordenada por score_aceptacion descendente (máximo 'limit' resultados).
    """
    campana_clean = campana_id.strip().lower()
    campanas_validas = ['brecha_mt', 'cross_sell', 'retencion']

    if campana_clean not in campanas_validas:
        raise HTTPException(
            status_code=404,
            detail=f"Campaña '{campana_id}' no encontrada. Campañas válidas: {', '.join(campanas_validas)}"
        )

    try:
        if not os.path.exists(ARCHIVO_CLIENTES) or not os.path.exists(ARCHIVO_COLA):
            raise HTTPException(status_code=500, detail="Archivos de datos no encontrados en backend/data/")

        df_cli = pd.read_csv(ARCHIVO_CLIENTES)
        df_cola = pd.read_csv(ARCHIVO_COLA)

        cols_merge = ['cliente_id']
        if 'gap_hogar_movil' in df_cli.columns:
            cols_merge.append('gap_hogar_movil')
        if 'fatiga_oferta' in df_cli.columns:
            cols_merge.append('fatiga_oferta')

        df_merged = df_cola.merge(df_cli[cols_merge], on='cliente_id', how='left')

        if campana_clean == 'brecha_mt':
            sub = df_merged[df_merged['brecha_mt'] == True]
        elif campana_clean == 'cross_sell':
            sub = df_merged[df_merged.get('gap_hogar_movil', False) == True]
        elif campana_clean == 'retencion':
            is_fatiga = df_merged.get('fatiga_oferta', False) == True
            is_alto = df_merged['riesgo'] == 'alto'
            sub = df_merged[is_alto | is_fatiga]
        else:
            sub = df_merged

        sub_sorted = sub.sort_values(by='score_aceptacion', ascending=False)
        if limit and limit > 0:
            sub_sorted = sub_sorted.head(limit)

        resultado = []
        for _, row in sub_sorted.iterrows():
            c_id = str(row['cliente_id'])
            num_clean = c_id.replace('CLI', '').lstrip('0')
            nombre_disp = f"Cliente #{num_clean.zfill(3)}"

            resultado.append({
                "cliente_id": c_id,
                "nombre_display": nombre_disp,
                "prioridad": str(row['prioridad']).lower(),
                "motivo_prioridad": str(row['motivo_prioridad']),
                "score_aceptacion": float(round(row['score_aceptacion'], 2)),
                "riesgo_churn": str(row['riesgo']).lower()
            })

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo campaña '{campana_id}': {str(e)}")


# 4. GET /cliente/{cliente_id}
@app.get("/cliente/{cliente_id}")
def get_cliente_detalle(cliente_id: str = Path(..., description="ID del cliente a consultar")):
    c_id_clean = cliente_id.strip().upper()

    try:
        if not os.path.exists(ARCHIVO_COLA):
            raise HTTPException(status_code=500, detail="Archivo 'data/cola_prioridad.csv' no encontrado.")

        df_cola = pd.read_csv(ARCHIVO_COLA)
        match = df_cola[df_cola['cliente_id'].str.upper() == c_id_clean]

        if match.empty:
            if os.path.exists(ARCHIVO_CLIENTES):
                df_cli = pd.read_csv(ARCHIVO_CLIENTES)
                if df_cli[df_cli['cliente_id'].str.upper() == c_id_clean].empty:
                    raise HTTPException(status_code=404, detail=f"Cliente ID '{cliente_id}' no encontrado en el sistema.")
            else:
                raise HTTPException(status_code=404, detail=f"Cliente ID '{cliente_id}' no encontrado.")

        if not match.empty:
            row_cola = match.iloc[0]
            nombre_oferta = str(row_cola['oferta_recomendada'])
            prioridad_heredada = str(row_cola['prioridad']).lower()
            brecha_mt = bool(row_cola['brecha_mt'])
        else:
            nombre_oferta = "Movistar Total Plus"
            prioridad_heredada = "alta"
            brecha_mt = True

        oferta_id = "OF001"
        if os.path.exists(ARCHIVO_OFERTAS):
            df_of = pd.read_csv(ARCHIVO_OFERTAS)
            m_of = df_of[df_of['nombre_oferta'].str.lower() == nombre_oferta.lower()]
            if not m_of.empty:
                oferta_id = str(m_of.iloc[0]['oferta_id'])

        pred_res = predecir_oferta(c_id_clean, oferta_id)
        score_acc = float(pred_res['probabilidad_aceptacion'])
        riesgo_churn = str(pred_res['riesgo'])

        exp_res = generar_explicacion(
            cliente_id=c_id_clean,
            oferta_id=oferta_id,
            variables_clave=pred_res['top_variables_explicativas'],
            score=score_acc,
            riesgo=riesgo_churn,
            nombre_oferta=nombre_oferta
        )

        es_mt = "total" in nombre_oferta.lower() or brecha_mt
        badges = ["elegible_mt"] if (brecha_mt or es_mt) else []
        badges.append(f"riesgo_churn_{riesgo_churn}")
        badges.append("contactado_3x")

        num_clean = c_id_clean.replace('CLI', '').lstrip('0')
        nombre_disp = f"Cliente #{num_clean.zfill(3)}"

        return {
            "cliente_id": c_id_clean,
            "nombre_display": nombre_disp,
            "oferta_recomendada": nombre_oferta,
            "oferta_id": oferta_id,
            "es_movistar_total": es_mt,
            "score_aceptacion": round(score_acc, 2),
            "prioridad": prioridad_heredada,
            "motivo": exp_res.get('motivo', ''),
            "guion": exp_res.get('guion', ''),
            "canal_sugerido": pred_res.get('canal_evaluado', 'Tienda'),
            "momento_sugerido": "Mañana",
            "badges": badges
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar detalle: {str(e)}")


# 5. POST /registrar-interaccion
@app.post("/registrar-interaccion")
def registrar_interaccion(datos: InteraccionInput):
    try:
        timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        registro_id = f"HIS-{int(time.time() * 1000)}"

        with open(ARCHIVO_INTERACCIONES, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                registro_id,
                datos.cliente_id,
                datos.oferta_id,
                datos.resultado,
                timestamp_str,
                datos.notas_asesor or ""
            ])

        return {
            "status": "ok",
            "mensaje": f"Interacción registrada correctamente para {datos.cliente_id}",
            "id": registro_id,
            "timestamp": timestamp_str
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar interacción: {str(e)}")


import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# 6. POST /chat-asesor (Copiloto Movistar IQ)
@app.post("/chat-asesor")
def chat_asesor(datos: ChatAsesorInput):
    c_id = datos.cliente_id.strip().upper()

    try:
        df_cli = pd.read_csv(ARCHIVO_CLIENTES).set_index('cliente_id')
        if c_id not in df_cli.index:
            raise HTTPException(status_code=404, detail=f"Cliente {c_id} no encontrado")

        row_c = df_cli.loc[c_id]
        
        oferta_id = datos.oferta_id or "OF001"
        df_of = pd.read_csv(ARCHIVO_OFERTAS).set_index('oferta_id')
        
        if oferta_id in df_of.index:
            row_o = df_of.loc[oferta_id]
            nombre_oferta = str(row_o.get('nombre_oferta', oferta_id))
            precio_oferta = float(row_o.get('precio_mensual', 0))
            gb_oferta = float(row_o.get('gb_incluidos', 0))
        else:
            nombre_oferta = "Movistar Total Plus"
            precio_oferta = 189.9
            gb_oferta = 60

        pred_res = predecir_oferta(c_id, oferta_id if oferta_id in df_of.index else "OF001")
        score_pct = int(round(pred_res['probabilidad_aceptacion'] * 100))
        riesgo = pred_res['riesgo']
        vars_top = pred_res['top_variables_explicativas']

        factores_str = "\n".join([f"- {v['variable']}: {v['valor']} ({v['efecto']})" for v in vars_top])

        # Formatear historial de mensajes (últimos 10 turnos)
        historial_str = ""
        if datos.historial_mensajes:
            ultimos = datos.historial_mensajes[-10:]
            turnos = []
            for m in ultimos:
                rol_label = "Asesor" if m.role in ["user", "advisor"] else "Copiloto"
                turnos.append(f"{rol_label}: {m.content}")
            historial_str = "\n".join(turnos)

        system_prompt = f"""
Eres el "Copiloto Movistar IQ", un asistente experto en ventas de telecomunicaciones de Movistar.
Estás apoyando en tiempo real a un asesor comercial que está atendiendo a este cliente:

INFORMACIÓN CONTEXTUAL DEL CLIENTE:
- Cliente ID: {c_id}
- Antigüedad: {row_c.get('antiguedad_meses', 0)} meses
- Tipo de Cliente: {row_c.get('tipo_cliente', 'postpago')}
- Canal Preferido: {row_c.get('canal_mas_usado', 'Tienda')}
- Oferta Recomendada por la IA: {nombre_oferta} (S/ {precio_oferta}/mes, {gb_oferta} GB)
- Probabilidad de Aceptación (ML): {score_pct}%
- Nivel de Riesgo de Churn: {riesgo.upper()} (Índice: {row_c.get('indice_riesgo', 0):.2f})
- Factores clave del modelo (SHAP):
{factores_str}

HISTORIAL PREVIO DE LA CONVERSACIÓN CON EL ASESOR:
{historial_str if historial_str else "(No hay mensajes previos en este turno)"}

PREGUNTA / DUDA ACTUAL DEL ASESOR:
"{datos.mensaje_usuario}"

INSTRUCCIONES CRÍTICAS:
1. Responde de forma DIRECTA y ESPECÍFICA a lo que el asesor te está pidiendo en "PREGUNTA / DUDA ACTUAL DEL ASESOR". Si pide un guión o script para el cliente, redacta el texto exacto que el asesor debe decirle al cliente. Si pide una técnica de objeción de precio, da los pasos exactos.
2. NO des introducciones genéricas de "Soy tu copiloto" ni repitas datos del cliente a menos que te los pida expresamente.
3. Toma en cuenta los mensajes previos si el asesor está haciendo una repregunta o pidiendo un ajuste.
4. Usa formato limpio con negritas (**texto**) y viñetas (- ) concisas y listas para usar en tienda/call center.
"""

        api_key = os.environ.get("GEMINI_API_KEY")
        modo_respuesta = "llm"

        # Verificar si la API key es válida
        es_key_valida = api_key and not api_key.startswith("AQ.Ab8RN6J") and "tu_api_key" not in api_key

        if not es_key_valida:
            logging.warning("[Copiloto Chat] GEMINI_API_KEY no configurada o es placeholder. Utilizando modo de respuesta de respaldo dinámico.")
            modo_respuesta = "respaldo"
            respuesta_texto = _generar_respuesta_chat_respaldo(
                pregunta=datos.mensaje_usuario,
                nombre_oferta=nombre_oferta,
                riesgo=riesgo,
                score_pct=score_pct,
                cliente_id=c_id,
                row_c=row_c,
                vars_top=vars_top,
                historial_mensajes=datos.historial_mensajes
            )
        else:
            try:
                client = genai.Client(api_key=api_key)
                modelo_nombre = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
                
                if hasattr(client, 'interactions') and callable(getattr(client.interactions, 'create', None)):
                    res = client.interactions.create(model=modelo_nombre, input=system_prompt)
                    # Extraer respuesta limpia del SDK de Google GenAI
                    respuesta_texto = getattr(res, 'output_text', None) or getattr(res, 'text', None) or str(res)
                else:
                    res = client.models.generate_content(model=modelo_nombre, contents=system_prompt)
                    respuesta_texto = getattr(res, 'text', str(res))

                if not respuesta_texto or not respuesta_texto.strip():
                    logging.warning("[Copiloto Chat] Gemini retornó una respuesta vacía. Activando respuesta de respaldo.")
                    modo_respuesta = "respaldo"
                    respuesta_texto = _generar_respuesta_chat_respaldo(
                        pregunta=datos.mensaje_usuario,
                        nombre_oferta=nombre_oferta,
                        riesgo=riesgo,
                        score_pct=score_pct,
                        cliente_id=c_id,
                        row_c=row_c,
                        vars_top=vars_top,
                        historial_mensajes=datos.historial_mensajes
                    )
            except Exception as e_genai:
                logging.warning(f"[Copiloto Chat] Error de red/cuota o llamada a API Gemini ({type(e_genai).__name__}): {e_genai}. Usando respuesta de respaldo dinámico.")
                modo_respuesta = "respaldo"
                respuesta_texto = _generar_respuesta_chat_respaldo(
                    pregunta=datos.mensaje_usuario,
                    nombre_oferta=nombre_oferta,
                    riesgo=riesgo,
                    score_pct=score_pct,
                    cliente_id=c_id,
                    row_c=row_c,
                    vars_top=vars_top,
                    historial_mensajes=datos.historial_mensajes
                )

        return {
            "cliente_id": c_id,
            "respuesta": respuesta_texto.strip(),
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "modo": modo_respuesta
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en Copiloto IA: {str(e)}")


def _generar_respuesta_chat_respaldo(
    pregunta: str,
    nombre_oferta: str,
    riesgo: str,
    score_pct: int,
    cliente_id: str,
    row_c: Any = None,
    vars_top: List[Dict[str, Any]] = None,
    historial_mensajes: List[ChatMessage] = None
) -> str:
    p_lower = pregunta.lower().strip()

    # 1. Saludos
    if any(w in p_lower for w in ['hola', 'buenas', 'saludos', 'quien eres', 'quién eres', 'que haces', 'qué haces']):
        return f"👋 **¡Hola! Soy tu Copiloto Movistar IQ**.\n- Estoy listo para ayudarte a cerrar la recomendación de **{nombre_oferta}** para el cliente **{cliente_id}**.\n- Puedo darte argumentos de precio, beneficios de conectividad o estrategias para riesgo {riesgo.upper()}. ¿En qué te ayudo?"

    # 2. Guión / Script / Pitch de venta
    if any(w in p_lower for w in ['guion', 'guión', 'script', 'speech', 'pitch', 'argumento', 'decirle', 'presentar']):
        return f"🗣️ **Guión de Venta Sugerido ({nombre_oferta})**:\n- *'Hola, revisando tu historial como cliente preferencial con propensión de **{score_pct}%**, tenemos hoy una mejora especial para actualizar tu plan a **{nombre_oferta}**.'*\n- *'Con esto aseguras máxima velocidad de datos y beneficios de conectividad con riesgo de corte nulo.'*\n- *'¿Te parece si realizamos la activación inmediata desde este momento?'*"

    # 3. Contexto detallado del cliente
    if any(w in p_lower for w in ['contexto', 'detalle del cliente', 'datos', 'informacion', 'información', 'antiguedad', 'antigüedad', 'perfil']):
        antiguedad = row_c.get('antiguedad_meses', 'N/A') if row_c is not None else 'N/A'
        tipo = row_c.get('tipo_cliente', 'Postpago') if row_c is not None else 'Postpago'
        canal = row_c.get('canal_mas_usado', 'Tienda') if row_c is not None else 'Tienda'
        factores_formatted = "\n".join([f"  • **{v['variable']}**: {v['valor']} ({v['efecto']})" for v in (vars_top or [])[:3]])
        return f"📋 **Contexto Detallado del Cliente ({cliente_id})**:\n- **Perfil**: Antigüedad de {antiguedad} meses | Tipo: {tipo} | Canal preferido: {canal}.\n- **Propensión y Riesgo**: Score de aceptación de **{score_pct}%** para **{nombre_oferta}** con riesgo de fuga **{riesgo.upper()}**.\n- **Factores clave (SHAP)**:\n{factores_formatted if factores_formatted else '  • Sin factores adicionales.'}"

    # 3. Preguntas de seguimiento / repreguntas sobre la respuesta anterior
    if any(w in p_lower for w in ['por que', 'por qué', 'dijiste', 'anterior', 'mencionaste', 'razon', 'razón', 'explic']):
        if historial_mensajes and len(historial_mensajes) > 0:
            ultimo_copiloto = None
            for m in reversed(historial_mensajes):
                if m.role in ['assistant', 'copiloto']:
                    ultimo_copiloto = m.content
                    break
            if ultimo_copiloto:
                factores_formatted = ", ".join([f"{v['variable']} ({v['valor']})" for v in (vars_top or [])[:2]])
                return f"💡 **Explicación contextual (basada en el mensaje anterior)**:\n- En relación con lo conversado anteriormente (*'{ultimo_copiloto[:75]}...'*), la recomendación para **{cliente_id}** se sustenta en **{factores_formatted if factores_formatted else 'su patrón de consumo'}** y su nivel de riesgo **{riesgo.upper()}**.\n- Ofrecer **{nombre_oferta}** busca asegurar una propensión del **{score_pct}%**."

    # 4. Precio
    if any(w in p_lower for w in ['caro', 'precio', 'costo', 'pagar', 'descuento', 'carisimo', 'carísimo']):
        return f"💡 **Técnica de Precio para {nombre_oferta}**:\n- **Desglosa el costo diario**: Equivale a menos de S/ 2.50 adicionales por día.\n- **Ahorro por Gigas**: Evita que el cliente compre paquetes adicionales a fin de mes ({score_pct}% propensión).\n- **Beneficio Hoy**: Recuérdale que la activación es inmediata y sin costo de instalación."

    # 5. Riesgo / Churn
    if any(w in p_lower for w in ['fuga', 'riesgo', 'churn', 'cancelar', 'baja', 'irse']):
        return f"⚠️ **Análisis de Riesgo de Fuga ({riesgo.upper()})**:\n- El cliente muestra riesgo por patrones históricos de sobreconsumo o antigüedad.\n- **Estrategia**: Presenta {nombre_oferta} como una atención de fidelización preferencial antes de que solicite la baja."

    # 6. Beneficios
    if any(w in p_lower for w in ['beneficio', 'ventaja', 'caracteristica', 'característica', 'giga', 'gb']):
        return f"🎯 **3 Beneficios Clave para {nombre_oferta}**:\n- **Bolsa Ampliada de Gigas**: Conexión continua sin cortes ni degradación de velocidad.\n- **Prioridad de Red**: Mejor experiencia en zonas de alta demanda.\n- **Sin Trámites**: Mantiene el mismo número y chip actual."

    # 7. Fallback dinámico (cuando no coincide ninguna categoría anterior)
    factores_formatted = "\n".join([f"  • **{v['variable']}**: {v['valor']} ({v['efecto']})" for v in (vars_top or [])[:3]])
    antiguedad = row_c.get('antiguedad_meses', 'N/A') if row_c is not None else 'N/A'
    return f"🤖 **Análisis Comercial para {cliente_id}**:\n- **Ficha**: Cliente {row_c.get('tipo_cliente', 'postpago') if row_c is not None else 'postpago'} ({antiguedad} meses de antigüedad) con riesgo **{riesgo.upper()}**.\n- **Drivers Clave (SHAP)**:\n{factores_formatted if factores_formatted else '  • Evaluación basada en modelo de propensión.'}\n- **Sugerencia de Cierre**: Presenta **{nombre_oferta}** destaca su propensión del **{score_pct}%** y ofrece activación inmediata."


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

