import os
import pandas as pd
import numpy as np
import joblib
import lightgbm as lgb
from sklearn.impute import SimpleImputer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_PATH = os.path.join(BASE_DIR, "modelo_aceptacion.pkl")

def entrenar_y_guardar():
    print("1. Cargando datos de entrenamiento (TRAIN) desde backend/data/...")
    train_path = os.path.join(DATA_DIR, 'tabla_entrenamiento_train.csv')
    train = pd.read_csv(train_path)

    features = [
        'ratio_consumo_plan', 'indice_riesgo', 'tendencia_gasto', 'gap_hogar_movil', 'brecha_mt',
        'tasa_aceptacion_cliente', 'tasa_aceptacion_canal_segmento', 'precio_mensual', 'gb_incluidos',
        'ahorro_pct', 'tipo_oferta', 'es_movistar_total', 'canal', 'tipo_cliente', 'antiguedad_meses'
    ]
    target = 'resultado'

    X_train_raw = train[features].copy()
    y_train = train[target].values

    bool_cols = ['gap_hogar_movil', 'brecha_mt', 'es_movistar_total']
    for c in bool_cols:
        X_train_raw[c] = X_train_raw[c].astype(int)

    cat_cols = ['tipo_oferta', 'canal', 'tipo_cliente']
    X_encoded = pd.get_dummies(X_train_raw, columns=cat_cols, drop_first=True)
    feature_columns = X_encoded.columns.tolist()

    imputer = SimpleImputer(strategy='median')
    X_imp = pd.DataFrame(imputer.fit_transform(X_encoded), columns=feature_columns)

    print("2. Entrenando modelo LightGBM...")
    model = lgb.LGBMClassifier(
        n_estimators=200,
        learning_rate=0.05,
        num_leaves=31,
        random_state=42,
        verbose=-1
    )
    model.fit(X_imp, y_train)

    tasa_cliente_map = train.groupby('cliente_id')['tasa_aceptacion_cliente'].first().to_dict()
    lookup_canal_segmento_map = train.groupby(['canal', 'tipo_cliente'])['tasa_aceptacion_canal_segmento'].first().to_dict()

    global_tasa_train = float(y_train.mean())

    artefacto = {
        'model': model,
        'feature_columns': feature_columns,
        'cat_cols': cat_cols,
        'bool_cols': bool_cols,
        'imputer': imputer,
        'tasa_cliente_map': tasa_cliente_map,
        'lookup_canal_segmento_map': lookup_canal_segmento_map,
        'global_tasa_train': global_tasa_train
    }

    print(f"3. Guardando modelo en {MODEL_PATH}...")
    joblib.dump(artefacto, MODEL_PATH)
    print("¡Modelo guardado exitosamente!")

if __name__ == '__main__':
    entrenar_y_guardar()
