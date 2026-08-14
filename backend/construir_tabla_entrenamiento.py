import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

def construir_tablas_entrenamiento():
    print("1. Cargando los 4 CSV desde backend/data/...")
    df_hist = pd.read_csv(os.path.join(DATA_DIR, 'historial_campanias_limpio.csv'))
    df_clientes = pd.read_csv(os.path.join(DATA_DIR, 'dataset_clientes_con_variables.csv'))
    df_ofertas = pd.read_csv(os.path.join(DATA_DIR, 'catalogo_ofertas_limpio.csv'))
    df_lookup = pd.read_csv(os.path.join(DATA_DIR, 'lookup_tasa_aceptacion_canal_segmento.csv'))

    print(f"   - Historial cargado: {df_hist.shape[0]} filas")
    print(f"   - Clientes cargados: {df_clientes.shape[0]} filas")
    print(f"   - Ofertas cargadas: {df_ofertas.shape[0]} filas")

    print("2. Convirtiendo 'fecha' a datetime...")
    df_hist['fecha'] = pd.to_datetime(df_hist['fecha'])

    print("3. Dividiendo el historial en TRAIN (Ene-Abr 2026) y TEST (May-Jun 2026)...")
    train_mask = (df_hist['fecha'] >= '2026-01-01') & (df_hist['fecha'] < '2026-05-01')
    test_mask = (df_hist['fecha'] >= '2026-05-01') & (df_hist['fecha'] <= '2026-06-30')

    df_train_raw = df_hist[train_mask].copy()
    df_test_raw = df_hist[test_mask].copy()

    print("4. Recalculando tasas de aceptación con Target Encoding Suavizado (Bayesian Shrinkage k=10 + Leave-One-Out)...")
    df_train_raw['target_num'] = (df_train_raw['resultado'] == 'aceptada').astype(int)

    global_tasa_train = float(df_train_raw['target_num'].mean())

    # Calcular estadísticas acumuladas por cliente en TRAIN
    stats_cliente = (
        df_train_raw.groupby('cliente_id')['target_num']
        .agg(sum_acc='sum', n_interacciones='count')
        .reset_index()
    )

    k_prior = 10.0  # Peso de la media global

    # Tasa suavizada completa para inferencia/TEST
    stats_cliente['tasa_aceptacion_cliente'] = (
        (stats_cliente['sum_acc'] + k_prior * global_tasa_train) / (stats_cliente['n_interacciones'] + k_prior)
    )

    # Merge de estadísticas generales en TRAIN para cálculo Leave-One-Out (LOO)
    df_train_raw = df_train_raw.merge(
        stats_cliente[['cliente_id', 'sum_acc', 'n_interacciones']], on='cliente_id', how='left'
    )
    # Cálculo Leave-One-Out para cada fila de TRAIN: excluye el target actual
    sum_loo = df_train_raw['sum_acc'] - df_train_raw['target_num']
    n_loo = df_train_raw['n_interacciones'] - 1
    df_train_raw['tasa_aceptacion_cliente'] = (sum_loo + k_prior * global_tasa_train) / (n_loo + k_prior)
    df_train_raw['n_interacciones_cliente'] = df_train_raw['n_interacciones']

    # Para TEST set: usamos el mapa de tasa suavizada completa y conteo de interacciones
    tasa_cliente_test_map = stats_cliente.set_index('cliente_id')['tasa_aceptacion_cliente'].to_dict()
    n_interacciones_test_map = stats_cliente.set_index('cliente_id')['n_interacciones'].to_dict()

    # Target encoding para canal-segmento con suavizado (k=50)
    stats_canal = (
        df_train_raw.groupby(['canal', 'tipo_cliente'])['target_num']
        .agg(sum_canal='sum', n_canal='count')
        .reset_index()
    )
    k_canal = 50.0
    stats_canal['tasa_aceptacion_canal_segmento'] = (
        (stats_canal['sum_canal'] + k_canal * global_tasa_train) / (stats_canal['n_canal'] + k_canal)
    )
    lookup_recalc = stats_canal[['canal', 'tipo_cliente', 'tasa_aceptacion_canal_segmento']]

    ofertas_sub = df_ofertas[
        ['oferta_id', 'precio_mensual', 'gb_incluidos', 'ahorro_pct', 'tipo_oferta', 'es_movistar_total']
    ].copy()

    cliente_cols = [
        'cliente_id', 'antiguedad_meses', 'monto_facturado_prom', 'consumo_datos_gb_prom',
        'ratio_consumo_plan', 'indice_riesgo', 'tendencia_gasto', 'gap_hogar_movil', 'brecha_mt'
    ]
    clientes_sub = df_clientes[cliente_cols].copy()

    def armar_dataset(df_bloque, es_train=True):
        df = df_bloque.copy()
        df['resultado'] = (df['resultado'] == 'aceptada').astype(int)
        if 'target_num' in df.columns:
            df.drop(columns=['target_num'], inplace=True)

        cols_hist_redundantes = ['tipo_oferta', 'es_movistar_total', 'nombre_oferta', 'oferta_es_mt', 'antiguedad_meses', 'sum_acc', 'n_interacciones']
        df.drop(columns=[c for c in cols_hist_redundantes if c in df.columns], inplace=True)

        df = df.merge(ofertas_sub, on='oferta_id', how='left')
        df = df.merge(clientes_sub, on='cliente_id', how='left')

        if not es_train:
            # En TEST, asignamos la tasa suavizada del cliente y número de interacciones
            df['tasa_aceptacion_cliente'] = df['cliente_id'].map(tasa_cliente_test_map).fillna(global_tasa_train)
            df['n_interacciones_cliente'] = df['cliente_id'].map(n_interacciones_test_map).fillna(0)

        df = df.merge(lookup_recalc, on=['canal', 'tipo_cliente'], how='left')
        df['tasa_aceptacion_canal_segmento'] = df['tasa_aceptacion_canal_segmento'].fillna(global_tasa_train)

        return df

    df_train_final = armar_dataset(df_train_raw, es_train=True)
    df_test_final = armar_dataset(df_test_raw, es_train=False)

    print("7. Guardando archivos CSV finales en backend/data/...")
    df_train_final.to_csv(os.path.join(DATA_DIR, 'tabla_entrenamiento_train.csv'), index=False)
    df_test_final.to_csv(os.path.join(DATA_DIR, 'tabla_entrenamiento_test.csv'), index=False)
    print("¡Proceso completado exitosamente!")

if __name__ == '__main__':
    construir_tablas_entrenamiento()
