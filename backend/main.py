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
    description="API para la herramienta interna de asesores comerciales Movistar (Cola de Prioridad, Inferencia y Copiloto IA)",
    version="1.2.0"
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


# 2. GET /cliente/{cliente_id}
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


# 3. POST /registrar-interaccion
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


# 4. POST /chat-asesor (Copiloto Movistar IQ)
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

        system_prompt = f"""
Eres el "Copiloto Movistar IQ", un asistente experto en ventas de telecomunicaciones de Movistar.
Estás apoyando en tiempo real a un asesor comercial que está atendiendo bajo presión de tiempo a este cliente:

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

PREGUNTA / DUDA DEL ASESOR:
"{datos.mensaje_usuario}"

INSTRUCCIONES:
1. Responde de forma muy directa, concisa y práctica (2 a 3 puntos o frases cortas).
2. Da argumentos comerciales contundentes, tips de negociación o cómo rebatir la objeción específica.
3. Mantén un tono motivador, profesional y directo para usarse en tienda o call center.
"""

        api_key = os.environ.get("GEMINI_API_KEY")

        if not api_key:
            respuesta_texto = _generar_respuesta_chat_respaldo(datos.mensaje_usuario, nombre_oferta, riesgo, score_pct, c_id)
        else:
            try:
                client = genai.Client(api_key=api_key)
                modelo_nombre = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
                
                if hasattr(client, 'interactions') and callable(getattr(client.interactions, 'create', None)):
                    res = client.interactions.create(model=modelo_nombre, input=system_prompt)
                    respuesta_texto = getattr(res, 'text', str(res))
                else:
                    res = client.models.generate_content(model=modelo_nombre, contents=system_prompt)
                    respuesta_texto = res.text
            except Exception as e_genai:
                print(f"[Error Copiloto Gemini] {e_genai}. Usando respuesta de respaldo dinámico.")
                respuesta_texto = _generar_respuesta_chat_respaldo(datos.mensaje_usuario, nombre_oferta, riesgo, score_pct, c_id)

        return {
            "cliente_id": c_id,
            "respuesta": respuesta_texto.strip(),
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en Copiloto IA: {str(e)}")


def _generar_respuesta_chat_respaldo(pregunta: str, nombre_oferta: str, riesgo: str, score_pct: int, cliente_id: str) -> str:
    p_lower = pregunta.lower().strip()

    if any(w in p_lower for w in ['hola', 'buenas', 'saludos', 'quien eres', 'quién eres', 'que haces', 'qué haces']):
        return f"👋 **¡Hola! Soy tu Copiloto Movistar IQ**.\n- Estoy listo para ayudarte a cerrar la recomendación de **{nombre_oferta}** para el cliente **{cliente_id}**.\n- Puedo darte argumentos de precio, beneficios de conectividad o estrategias para riesgo {riesgo.upper()}. ¿En qué te ayudo?"

    if any(w in p_lower for w in ['caro', 'precio', 'costo', 'pagar', 'descuento', 'carisimo']):
        return f"💡 **Técnica de Precio para {nombre_oferta}**:\n- **Desglosa el costo diario**: Equivale a menos de S/ 2.50 adicionales por día.\n- **Ahorro por Gigas**: Evita que el cliente compre paquetes adicionales a fin de mes ({score_pct}% propensión).\n- **Beneficio Hoy**: Recuérdale que la activación es inmediata y sin costo de instalación."

    if any(w in p_lower for w in ['fuga', 'riesgo', 'churn', 'cancelar', 'baja', 'irse']):
        return f"⚠️ **Análisis de Riesgo de Fuga ({riesgo.upper()})**:\n- El cliente muestra riesgo por patrones históricos de sobreconsumo o antigüedad.\n- **Estrategia**: Presenta {nombre_oferta} como una atención de fidelización preferencial antes de que solicite la baja."

    if any(w in p_lower for w in ['beneficio', 'ventaja', 'por que', 'por qué', 'caracteristica', 'giga', 'gb']):
        return f"🎯 **3 Beneficios Clave para {nombre_oferta}**:\n- **Bolsa Ampliada de Gigas**: Conexión continua sin cortes ni degradación de velocidad.\n- **Prioridad de Red**: Mejor experiencia en zonas de alta demanda.\n- **Sin Trámites**: Mantiene el mismo número y chip actual."

    return f"🤖 **Sugerencia Comercial ({nombre_oferta})**:\n- Para tu consulta *'{pregunta}'*: enfócate en el beneficio inmediato de {nombre_oferta} ({score_pct}% de propensión).\n- Haz una pregunta de cierre directo: *'¿Desea que le activemos la mejora de plan desde hoy mismo?'*"


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
