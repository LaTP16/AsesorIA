import os
import pandas as pd
import numpy as np
import joblib
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_PATH = os.path.join(BASE_DIR, "modelo_aceptacion.pkl")
CLIENTES_PATH = os.path.join(DATA_DIR, "dataset_clientes_con_variables.csv")
OFERTAS_PATH = os.path.join(DATA_DIR, "catalogo_ofertas_limpio.csv")
COLA_PATH = os.path.join(DATA_DIR, "cola_prioridad.csv")

def generar_cola_prioridad():
    t0 = time.time()
    print("1. Cargando datos y modelo preentrenado...")
    artefacto = joblib.load(MODEL_PATH)
    clientes = pd.read_csv(CLIENTES_PATH)
    ofertas = pd.read_csv(OFERTAS_PATH)

    print(f"   - Clientes cargados: {len(clientes)}")
    print(f"   - Ofertas en catálogo: {len(ofertas)}")

    movil_types = ['plan_movil', 'movistar_total', 'upgrade', 'equipo', 'paquete_adicional']
    hogar_types = ['plan_hogar', 'movistar_total', 'upgrade', 'equipo', 'paquete_adicional']

    ofertas_movil = set(ofertas[ofertas['tipo_oferta'].isin(movil_types)]['oferta_id'])
    ofertas_hogar = set(ofertas[ofertas['tipo_oferta'].isin(hogar_types)]['oferta_id'])
    ofertas_todas = set(ofertas['oferta_id'])

    pairs = []
    for idx, row in clientes.iterrows():
        c_id = row['cliente_id']
        has_m = bool(row.get('tiene_movil', False))
        has_h = bool(row.get('tiene_hogar', False))

        if has_m and not has_h:
            cands = ofertas_movil
        elif has_h and not has_m:
            cands = ofertas_hogar
        else:
            cands = ofertas_todas

        for o_id in cands:
            pairs.append((c_id, o_id))

    df_pairs = pd.DataFrame(pairs, columns=['cliente_id', 'oferta_id'])
    df_merged = df_pairs.merge(clientes, on='cliente_id', how='left').merge(
        ofertas, on='oferta_id', how='left', suffixes=('_cliente', '_oferta')
    )

    canal_series = df_merged['canal_mas_usado'].fillna('Tienda').apply(
        lambda x: str(x) if str(x) in ['Call In', 'Call Out', 'Tienda', 'Digital'] else 'Tienda'
    )
    tipo_cli_series = df_merged['tipo_cliente'].fillna('postpago').astype(str)

    tasa_cli_map = artefacto['tasa_cliente_map']
    global_tasa = artefacto['global_tasa_train']
    tasa_cli_series = df_merged['cliente_id'].map(lambda cid: tasa_cli_map.get(cid, global_tasa))

    lookup_cs_map = artefacto['lookup_canal_segmento_map']
    tasa_cs_series = [lookup_cs_map.get((c, s), global_tasa) for c, s in zip(canal_series, tipo_cli_series)]

    input_df = pd.DataFrame({
        'ratio_consumo_plan': df_merged['ratio_consumo_plan'],
        'indice_riesgo': df_merged['indice_riesgo'].fillna(0.0),
        'tendencia_gasto': df_merged['tendencia_gasto'].fillna(0.0),
        'gap_hogar_movil': df_merged['gap_hogar_movil'].astype(int),
        'brecha_mt': df_merged['brecha_mt'].astype(int),
        'tasa_aceptacion_cliente': tasa_cli_series,
        'tasa_aceptacion_canal_segmento': tasa_cs_series,
        'precio_mensual': df_merged['precio_mensual'].fillna(0.0),
        'gb_incluidos': df_merged['gb_incluidos'].fillna(0),
        'ahorro_pct': df_merged['ahorro_pct'].fillna(0),
        'tipo_oferta': df_merged['tipo_oferta'].fillna(''),
        'es_movistar_total': df_merged['es_movistar_total_oferta'].astype(int),
        'canal': canal_series,
        'tipo_cliente': tipo_cli_series,
        'antiguedad_meses': df_merged['antiguedad_meses'].fillna(0)
    })

    # IMPORTANTE: drop_first=False para no eliminar columnas categóricas erróneamente
    df_encoded = pd.get_dummies(input_df, columns=artefacto['cat_cols'], drop_first=False)
    df_full = df_encoded.reindex(columns=artefacto['feature_columns'], fill_value=0)
    X_imp = pd.DataFrame(artefacto['imputer'].transform(df_full), columns=artefacto['feature_columns'])

    # Inferencia en batch
    df_merged['probabilidad_aceptacion'] = artefacto['model'].predict_proba(X_imp)[:, 1]

    # Seleccionar la MEJOR oferta por cliente (máxima probabilidad)
    best_df = (
        df_merged.sort_values(['cliente_id', 'probabilidad_aceptacion'], ascending=[True, False])
        .groupby('cliente_id')
        .first()
        .reset_index()
    )

    def clasificar_riesgo_val(val):
        val = float(val) if pd.notna(val) else 0.0
        if val > 0.66:
            return 'alto', 1.0
        elif val >= 0.33:
            return 'medio', 0.5
        else:
            return 'bajo', 0.0

    riesgo_tuples = [clasificar_riesgo_val(r) for r in best_df['indice_riesgo']]
    best_df['riesgo'] = [t[0] for t in riesgo_tuples]
    best_df['riesgo_num'] = [t[1] for t in riesgo_tuples]
    best_df['brecha_mt_num'] = best_df['brecha_mt'].astype(int)

    best_df['prioridad_score'] = (
        0.5 * best_df['probabilidad_aceptacion'] +
        0.3 * best_df['riesgo_num'] +
        0.2 * best_df['brecha_mt_num']
    )

    def clasificar_prioridad_negocio(row):
        r_str = str(row['riesgo'])
        p_acc = float(row['probabilidad_aceptacion'])
        p_score = float(row['prioridad_score'])
        
        if r_str == 'alto' or p_score >= 0.50 or p_acc >= 0.85:
            return 'alta'
        elif r_str == 'medio' or p_score >= 0.40 or p_acc >= 0.70:
            return 'media'
        else:
            return 'baja'

    best_df['prioridad'] = best_df.apply(clasificar_prioridad_negocio, axis=1)

    def generar_motivo_comercial(row):
        nombre_of = str(row.get('nombre_oferta', row.get('oferta_id', '')))
        r_str = str(row['riesgo']).lower()
        es_mt = bool(row.get('es_movistar_total_oferta', False)) or bool(row.get('brecha_mt', False))

        if r_str == 'alto':
            if es_mt:
                return f"Riesgo de fuga alto + Candidato a Movistar Total ({nombre_of})"
            else:
                return f"Riesgo de fuga alto + Retención prioritaria ({nombre_of})"
        elif r_str == 'medio':
            if es_mt:
                return f"Riesgo de fuga medio + Candidato a Movistar Total ({nombre_of})"
            else:
                return f"Riesgo de fuga medio + Oportunidad {nombre_of}"
        else: # bajo
            if es_mt:
                return f"Oportunidad Convergente Movistar Total ({nombre_of})"
            else:
                return f"Alta propensión de aceptación para {nombre_of}"

    best_df['motivo_prioridad'] = best_df.apply(generar_motivo_comercial, axis=1)

    # Interleaving strategy for top commercial diversity in the queue
    def categorizar_situacion(row):
        r = str(row['riesgo']).lower()
        b = bool(row['brecha_mt'])
        s = float(row['probabilidad_aceptacion'])
        
        if r == 'alto':
            return 'retencion'
        elif b and s >= 0.65:
            return 'movistar_total'
        elif r == 'medio' and s >= 0.70:
            return 'upsell'
        elif s >= 0.80:
            return 'cross_sell'
        else:
            return 'estandar'

    best_df['situacion_tag'] = best_df.apply(categorizar_situacion, axis=1)

    # Separate buckets sorted by prioridad_score descending
    df_ret = best_df[best_df['situacion_tag'] == 'retencion'].sort_values('prioridad_score', ascending=False)
    df_mt = best_df[best_df['situacion_tag'] == 'movistar_total'].sort_values('prioridad_score', ascending=False)
    df_cs = best_df[best_df['situacion_tag'] == 'cross_sell'].sort_values('prioridad_score', ascending=False)
    df_ups = best_df[best_df['situacion_tag'] == 'upsell'].sort_values('prioridad_score', ascending=False)
    df_est = best_df[~best_df['cliente_id'].isin(
        set(df_ret['cliente_id']).union(set(df_mt['cliente_id'])).union(set(df_cs['cliente_id'])).union(set(df_ups['cliente_id']))
    )].sort_values('prioridad_score', ascending=False)

    rec_ret = df_ret.to_dict('records')
    rec_mt = df_mt.to_dict('records')
    rec_cs = df_cs.to_dict('records')
    rec_ups = df_ups.to_dict('records')
    rec_est = df_est.to_dict('records')

    i_ret = i_mt = i_cs = i_ups = i_est = 0
    len_ret, len_mt, len_cs, len_ups, len_est = len(rec_ret), len(rec_mt), len(rec_cs), len(rec_ups), len(rec_est)

    ordered_records = []
    while len(ordered_records) < len(best_df):
        if i_ret < len_ret:
            ordered_records.append(rec_ret[i_ret]); i_ret += 1
        if i_mt < len_mt:
            ordered_records.append(rec_mt[i_mt]); i_mt += 1
        if i_cs < len_cs:
            ordered_records.append(rec_cs[i_cs]); i_cs += 1
        if i_ups < len_ups:
            ordered_records.append(rec_ups[i_ups]); i_ups += 1
        elif i_est < len_est:
            ordered_records.append(rec_est[i_est]); i_est += 1

    best_df = pd.DataFrame(ordered_records)

    cola_df = pd.DataFrame({
        'cliente_id': best_df['cliente_id'],
        'oferta_recomendada': best_df['nombre_oferta'],
        'score_aceptacion': best_df['probabilidad_aceptacion'].round(4),
        'riesgo': best_df['riesgo'],
        'brecha_mt': best_df['brecha_mt'].astype(bool),
        'prioridad': best_df['prioridad'],
        'motivo_prioridad': best_df['motivo_prioridad']
    })

    cola_df.to_csv(COLA_PATH, index=False)
    print(f"¡Cola de prioridad corregida guardada exitosamente en '{COLA_PATH}' en {time.time()-t0:.2f}s!")

if __name__ == '__main__':
    generar_cola_prioridad()
