# AsesorIA - Herramienta de Inteligencia Comercial para Asesores

**AsesorIA** es una aplicación web interna y motor predictivo de priorización comercial diseñado para asesores de tienda y call center de Movistar.

---

## 📁 Estructura del Proyecto

```text
AsesorIA/
├── README.md                          # Guía de inicio rápido y documentación del proyecto
├── frontend/                          # Aplicación Web Next.js 15 (App Router) + TailwindCSS
│   ├── src/                           # Código fuente (Cola de Prioridad, Ficha de Cliente, Historial)
│   ├── package.json                   # Dependencias de frontend
│   └── ...
└── backend/                           # API FastAPI, modelo Machine Learning e inferencia LLM
    ├── main.py                        # Servidor REST API (GET /cola-prioridad, GET /cliente/{id}, POST /registrar-interaccion)
    ├── predecir_oferta.py             # Inferencia del modelo LightGBM + explicabilidad SHAP + regla de riesgo
    ├── generar_explicacion.py         # Integración con Google Gemini (google-genai SDK) para motivos y guiones de venta
    ├── generar_cola_prioridad.py      # Script de puntuación y generación masiva de la Cola de Prioridad
    ├── entrenar_modelo.py             # Script de entrenamiento y evaluación comparativa vs Regresión Logística
    ├── construir_tabla_entrenamiento.py # Preparación de datos de entrenamiento sin data leakage
    ├── modelo_aceptacion.pkl          # Artefacto serializado del modelo LightGBM y preprocesadores
    ├── requirements.txt               # Librerías de Python requeridas
    ├── .env.example                   # Plantilla de variables de entorno para API Key de Gemini
    └── data/                          # Datasets en CSV (clientes, ofertas, historial, cola de prioridad)
```

---

## 🚀 Instrucciones para Ejecutar

### 1. Iniciar el Backend (FastAPI + Python)

En una terminal, navega a la carpeta `backend`, instala dependencias e inicia el servidor:

```bash
cd backend
pip install -r requirements.txt

# Configurar tu API Key de Google AI Studio para explicaciones generativas en vivo
copy .env.example .env
# IMPORTANTE (Seguridad): Obtén tu API Key real en Google AI Studio y edita la variable GEMINI_API_KEY dentro de backend/.env.
# NUNCA commitees la API Key real en .env.example ni en el repositorio.

# Iniciar servidor Uvicorn en http://localhost:8000
uvicorn main:app --reload
```

El backend quedará disponible en:
- **API Base**: [http://localhost:8000](http://localhost:8000)
- **Documentación Swagger / OpenAPI**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Iniciar el Frontend (Next.js + TailwindCSS)

En una segunda terminal, navega a la carpeta `frontend`, instala dependencias e inicia el servidor de desarrollo:

```bash
cd frontend
npm install
npm run dev
```

La aplicación web quedará disponible en:
- **AsesorIA Web App**: [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Endpoints Principales de la API (`http://localhost:8000`)

- `GET /cola-prioridad`: Retorna la lista de clientes priorizados ordenados de mayor a menor urgencia.
- `GET /cliente/{cliente_id}`: Retorna la ficha técnica del cliente con el score de aceptación, motivo en lenguaje natural y guión de venta.
- `POST /registrar-interaccion`: Registra la respuesta del cliente (`mostrada`, `aceptada`, `rechazada`) en el historial de trazabilidad.

---

## 🤖 Modelo de Machine Learning

- **Algoritmo**: LightGBM Classifier (Evaluado temporalmente TRAIN: Ene-Abr 2026 vs TEST: May-Jun 2026).
- **Prevención de Fuga**: Tasas de aceptación recalculadas estrictamente sobre el periodo TRAIN.
- **Explicabilidad**: SHAP (SHapley Additive exPlanations) para identificar las 3 variables de mayor impacto por cliente.
