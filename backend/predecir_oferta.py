import os
import pandas as pd
import numpy as np
import joblib
import shap

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_PATH = os.path.join(BASE_DIR, "modelo_aceptacion.pkl")
CLIENTES_PATH = os.path.join(DATA_DIR, "dataset_clientes_con_variables.csv")
OFERTAS_PATH = os.path.join(DATA_DIR, "catalogo_ofertas_limpio.csv")

_ARTEFACTO = None
_DF_CLIENTES = None
_DF_OFERTAS = None
_SHAP_EXPLAINER = None

def _cargar_recursos():
    global _ARTEFACTO, _DF_CLIENTES, _DF_OFERTAS, _SHAP_EXPLAINER
    if _ARTEFACTO is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"No se encontró el modelo pickle en {MODEL_PATH}")
        _ARTEFACTO = joblib.load(MODEL_PATH)
        _DF_CLIENTES = pd.read_csv(CLIENTES_PATH).set_index('cliente_id')
        _DF_OFERTAS = pd.read_csv(OFERTAS_PATH).set_index('oferta_id')
        _SHAP_EXPLAINER = shap.TreeExplainer(_ARTEFACTO['model'])

def predecir_oferta(cliente_id: str, oferta_id: str, canal: str = None) -> dict:
    _cargar_recursos()

    if cliente_id not in _DF_CLIENTES.index:
        raise ValueError(f"Cliente ID '{cliente_id}' no encontrado en {CLIENTES_PATH}")
    if oferta_id not in _DF_OFERTAS.index:
        raise ValueError(f"Oferta ID '{oferta_id}' no encontrada en {OFERTAS_PATH}")

    row_cliente = _DF_CLIENTES.loc[cliente_id]
    row_oferta = _DF_OFERTAS.loc[oferta_id]

    if canal is None:
        canal = str(row_cliente.get('canal_mas_usado', 'Tienda'))
        if canal not in ['Call In', 'Call Out', 'Tienda', 'Digital']:
            canal = 'Tienda'

    tipo_cliente = str(row_cliente.get('tipo_cliente', 'postpago'))

    tasa_cliente = _ARTEFACTO['tasa_cliente_map'].get(cliente_id, _ARTEFACTO['global_tasa_train'])
    tasa_canal_seg = _ARTEFACTO['lookup_canal_segmento_map'].get(
        (canal, tipo_cliente), _ARTEFACTO['global_tasa_train']
    )

    input_dict = {
        'ratio_consumo_plan': float(row_cliente.get('ratio_consumo_plan', np.nan)),
        'indice_riesgo': float(row_cliente.get('indice_riesgo', 0.0)),
        'tendencia_gasto': float(row_cliente.get('tendencia_gasto', 0.0)),
        'gap_hogar_movil': int(bool(row_cliente.get('gap_hogar_movil', False))),
        'brecha_mt': int(bool(row_cliente.get('brecha_mt', False))),
        'tasa_aceptacion_cliente': float(tasa_cliente),
        'tasa_aceptacion_canal_segmento': float(tasa_canal_seg),
        'precio_mensual': float(row_oferta.get('precio_mensual', 0.0)),
        'gb_incluidos': float(row_oferta.get('gb_incluidos', 0)),
        'ahorro_pct': float(row_oferta.get('ahorro_pct', 0)),
        'tipo_oferta': str(row_oferta.get('tipo_oferta', '')),
        'es_movistar_total': int(bool(row_oferta.get('es_movistar_total', False))),
        'canal': canal,
        'tipo_cliente': tipo_cliente,
        'antiguedad_meses': float(row_cliente.get('antiguedad_meses', 0))
    }

    df_single = pd.DataFrame([input_dict])
    df_encoded = pd.get_dummies(df_single, columns=_ARTEFACTO['cat_cols'], drop_first=False)
    df_full = df_encoded.reindex(columns=_ARTEFACTO['feature_columns'], fill_value=0)
    X_imp = pd.DataFrame(_ARTEFACTO['imputer'].transform(df_full), columns=_ARTEFACTO['feature_columns'])

    proba = float(_ARTEFACTO['model'].predict_proba(X_imp)[0, 1])

    shap_vals = _SHAP_EXPLAINER.shap_values(X_imp)
    sample_shap = shap_vals[1][0] if isinstance(shap_vals, list) else shap_vals[0]
    top3_indices = np.argsort(np.abs(sample_shap))[-3:][::-1]

    top_variables_explicativas = []
    for idx in top3_indices:
        feat_name = _ARTEFACTO['feature_columns'][idx]
        feat_val = X_imp.iloc[0, idx]
        shap_score = float(sample_shap[idx])
        top_variables_explicativas.append({
            'variable': feat_name,
            'valor': float(feat_val),
            'impacto_shap': round(shap_score, 4),
            'efecto': "Aumenta probabilidad" if shap_score > 0 else "Reduce probabilidad"
        })

    val_riesgo = float(row_cliente.get('indice_riesgo', 0.0))
    if val_riesgo > 0.66:
        etiqueta_riesgo = 'alto'
    elif val_riesgo >= 0.33:
        etiqueta_riesgo = 'medio'
    else:
        etiqueta_riesgo = 'bajo'

    return {
        'cliente_id': cliente_id,
        'oferta_id': oferta_id,
        'probabilidad_aceptacion': round(proba, 4),
        'riesgo': etiqueta_riesgo,
        'indice_riesgo_valor': round(val_riesgo, 4),
        'canal_evaluado': canal,
        'top_variables_explicativas': top_variables_explicativas
    }

if __name__ == '__main__':
    res = predecir_oferta("CLI000042", "OF001")
    print(res)
