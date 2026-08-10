import os
import json
import pandas as pd
from dotenv import load_dotenv
from google import genai
from predecir_oferta import predecir_oferta

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
OFERTAS_PATH = os.path.join(DATA_DIR, "catalogo_ofertas_limpio.csv")

def generar_explicacion(cliente_id: str, oferta_id: str, variables_clave: list, score: float, riesgo: str = 'medio', nombre_oferta: str = None) -> dict:
    nombres_humanos = {
        'tasa_aceptacion_cliente': 'tasa de aceptación histórica del cliente',
        'tendencia_gasto': 'tendencia de consumo y facturación',
        'antiguedad_meses': 'antigüedad en Movistar',
        'indice_riesgo': 'nivel de riesgo de fuga',
        'ratio_consumo_plan': 'porcentaje de gigas consumidos sobre el límite del plan',
        'precio_mensual': 'precio mensual de la oferta',
        'tasa_aceptacion_canal_segmento': 'afinidad por el canal de atención',
        'brecha_mt': 'candidato a paquete convergente Movistar Total',
        'gb_incluidos': 'gigas incluidos en el plan',
        'ahorro_pct': 'descuento promocional ofrecido',
        'gap_hogar_movil': 'cliente con solo un servicio que requiere convergencia'
    }

    vars_text = []
    if isinstance(variables_clave, list):
        for v in variables_clave:
            if isinstance(v, dict):
                var_raw = v.get('variable', '')
                var_val = v.get('valor', '')
                var_name = nombres_humanos.get(var_raw, var_raw)
                vars_text.append(f"- {var_name} (valor: {var_val})")
            else:
                vars_text.append(f"- {v}")

    vars_str = "\n".join(vars_text) if vars_text else "- Alta propensión general detectada por el modelo"

    if not nombre_oferta:
        try:
            if os.path.exists(OFERTAS_PATH):
                df_of = pd.read_csv(OFERTAS_PATH).set_index('oferta_id')
                nombre_oferta = df_of.loc[oferta_id, 'nombre_oferta'] if oferta_id in df_of.index else oferta_id
            else:
                nombre_oferta = oferta_id
        except Exception:
            nombre_oferta = oferta_id

    prompt = f"""
Eres un asistente comercial experto en telecomunicaciones para asesores de Movistar.
Se ha identificado una oportunidad de venta priorizada para el siguiente cliente:

- Cliente ID: {cliente_id}
- Oferta Recomendada: {nombre_oferta} (ID: {oferta_id})
- Probabilidad de Aceptación (Score): {score}
- Nivel de Riesgo de Fuga (Churn): {riesgo}
- Factores principales detectados por el modelo ML:
{vars_str}

Instrucciones:
Genera una respuesta en español strictly en formato JSON válido con dos campos:
1. "motivo": Una SOLA frase en lenguaje natural simple, sin jerga técnica ni nombres de variables crudas (ej. "Su consumo de datos está cerca del límite de su plan actual y suele responder bien a ofertas en tienda.").
2. "guion": Un guion de venta corto (2 a 3 frases) empático y persuasivo listo para que el asesor lo lea en voz alta al cliente.

JSON:
"""

    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        return _generar_respuesta_respaldo(nombre_oferta, riesgo, score)

    try:
        client = genai.Client(api_key=api_key)
        modelo_nombre = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

        if hasattr(client, 'interactions') and callable(getattr(client.interactions, 'create', None)):
            res = client.interactions.create(model=modelo_nombre, input=prompt)
            raw_text = getattr(res, 'text', str(res))
        else:
            res = client.models.generate_content(model=modelo_nombre, contents=prompt)
            raw_text = res.text

        parsed = _extraer_json(raw_text)
        if parsed and 'motivo' in parsed and 'guion' in parsed:
            return {'motivo': parsed['motivo'], 'guion': parsed['guion']}
        else:
            return _generar_respuesta_respaldo(nombre_oferta, riesgo, score)

    except Exception as e:
        print(f"[Aviso API Gemini] Error ({e}). Retornando respuesta genérica de respaldo.")
        return _generar_respuesta_respaldo(nombre_oferta, riesgo, score)


def _generar_respuesta_respaldo(nombre_oferta: str, riesgo: str, score: float) -> dict:
    score_pct = int(round(score * 100)) if isinstance(score, (int, float)) else 80
    return {
        'motivo': f"Cliente con {score_pct}% de probabilidad de aceptación para {nombre_oferta} y nivel de riesgo {riesgo}.",
        'guion': f"Hola, detectamos que eres un cliente preferencial en Movistar. Hoy tenemos una oferta especial para actualizar tu plan a {nombre_oferta} con beneficios exclusivos inmediatos."
    }


def _extraer_json(texto: str) -> dict:
    try:
        clean = texto.strip()
        if clean.startswith("```json"): clean = clean[7:]
        if clean.startswith("```"): clean = clean[3:]
        if clean.endswith("```"): clean = clean[:-3]
        return json.loads(clean.strip())
    except Exception:
        return {}
