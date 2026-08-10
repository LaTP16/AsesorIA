# Movistar IQ - Frontend V1 (Versión Sintética Autónoma)

Esta carpeta **`frontend_V1`** contiene la versión sintética e independiente de **Movistar IQ** construida en **Next.js 15 (App Router)** + **TailwindCSS**.

No requiere ningún servidor backend de Python (`localhost:8000`) para funcionar, lo que la hace **100% autónoma y lista para ser desplegada directamente en Vercel**.

---

## 🚀 Despliegue en Vercel

### Opción 1: Mediante la CLI de Vercel (Recomendado)

En tu terminal, navega a esta carpeta y ejecuta:

```bash
cd frontend_V1
npx vercel
```

Sigue los pasos interactivos en la pantalla (presiona `Enter` para aceptar las opciones por defecto). ¡Tu aplicación quedará desplegada en un enlace público `.vercel.app` en menos de 1 minuto!

---

### Opción 2: Conectar un Repositorio GitHub a Vercel

1. Sube el código a tu repositorio de GitHub.
2. Ingresa al panel de [Vercel Dashboard](https://vercel.com/dashboard).
3. Haz clic en **"Add New Project"** e importa tu repositorio.
4. En el campo **"Root Directory"**, selecciona la carpeta **`frontend_V1`**.
5. Haz clic en **"Deploy"**.

---

## 💻 Desarrollo Local

Para ejecutar esta versión localmente:

```bash
cd frontend_V1
npm install
npm run dev
```

Abre en tu navegador: **[http://localhost:3000](http://localhost:3000)**

---

## 📱 Vistas e Interacciones Sintéticas Incluidas

- **`/` (Cola de Prioridad)**: 15 clientes priorizados con búsqueda, filtros por urgencia y nivel de riesgo.
- **`/panorama` (Panorama Comercial)**: 4 Tarjetas de KPI + 3 Campañas interactivas (*Brecha Movistar Total*, *Cross-sell*, *Retención*).
- **`/historial` (Historial de Atenciones)**: 3 KPIs de conversión + Tabla responsiva de atenciones registradas.
- **`/cliente/[id]` (Ficha de Cliente)**: Ficha de recomendación en <10s, 3 botones de acción comerciales (*Oferta mostrada*, *Aceptada*, *Rechazada*) con Toast feedback, y el **Copiloto Movistar IQ** (columna fija a la derecha en desktop y botón flotante FAB en móvil).
