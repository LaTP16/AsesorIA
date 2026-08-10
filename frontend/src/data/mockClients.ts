export interface ClienteFicha {
  cliente_id: string;
  nombre_display: string;
  prioridad: 'alta' | 'media' | 'baja';
  motivo_prioridad: string;
  oferta_recomendada: string;
  es_movistar_total: boolean;
  score_aceptacion: number; // 0.0 - 1.0
  motivo: string;
  canal_sugerido: string;
  momento_sugerido: string;
  badges: string[]; // e.g. ["elegible_mt", "contactado_3x", "riesgo_churn_alto"]
  riesgo_churn: 'alto' | 'medio' | 'bajo';
  plan_actual?: string;
  antiguedad_meses?: number;
}

export type Cliente = ClienteFicha;

export const MOCK_CLIENTES_FICHAS: ClienteFicha[] = [
  {
    cliente_id: "CLI000042",
    nombre_display: "Cliente #042",
    prioridad: "alta",
    motivo_prioridad: "Riesgo de fuga alto + candidato a Movistar Total",
    oferta_recomendada: "Movistar Total Plus",
    es_movistar_total: true,
    score_aceptacion: 0.78,
    motivo: "Su consumo de datos está muy cerca del límite de su plan actual y suele responder bien a ofertas presentadas en tienda.",
    canal_sugerido: "Tienda",
    momento_sugerido: "Mañana",
    badges: ["elegible_mt", "contactado_3x", "riesgo_churn_alto"],
    riesgo_churn: "alto"
  },
  {
    cliente_id: "CLI000019",
    nombre_display: "Cliente #019",
    prioridad: "alta",
    motivo_prioridad: "Reclamo por cobro no reconocido + Portabilidad en riesgo",
    oferta_recomendada: "Plan Móvil Max 50GB + 40% DSCTO",
    es_movistar_total: false,
    score_aceptacion: 0.85,
    motivo: "Presenta alto riesgo de migrar a la competencia tras su último reclamo. Valora soluciones inmediatas y descuentos directos en recibo.",
    canal_sugerido: "Call Center",
    momento_sugerido: "Inmediato",
    badges: ["riesgo_churn_alto", "reclamo_reciente"],
    riesgo_churn: "alto"
  },
  {
    cliente_id: "CLI000087",
    nombre_display: "Cliente #087",
    prioridad: "alta",
    motivo_prioridad: "Fin de contrato + Propensión alta a renovación Smartphone",
    oferta_recomendada: "Renovación Smartphone 5G Cuota S/0",
    es_movistar_total: false,
    score_aceptacion: 0.82,
    motivo: "Cumplió 24 meses de permanencia y ha buscado equipos de gama alta en la web durante los últimos 7 días.",
    canal_sugerido: "Tienda",
    momento_sugerido: "Tarde",
    badges: ["fin_contrato", "renovación_equipo"],
    riesgo_churn: "medio"
  },
  {
    cliente_id: "CLI000064",
    nombre_display: "Cliente #064",
    prioridad: "media",
    motivo_prioridad: "Consumo al 95% de gigas + Candidato Upgrade Plan Top",
    oferta_recomendada: "Plan Móvil Max 50GB",
    es_movistar_total: false,
    score_aceptacion: 0.74,
    motivo: "Agota sus datos móviles antes del día 20 de cada mes y suele aceptar upgrades cuando la diferencia de precio es menor a S/15.",
    canal_sugerido: "App / SMS",
    momento_sugerido: "Noche",
    badges: ["consumo_gigas_alto"],
    riesgo_churn: "medio"
  },
  {
    cliente_id: "CLI000103",
    nombre_display: "Cliente #103",
    prioridad: "media",
    motivo_prioridad: "Cliente Fibra sin línea móvil asociada (Cross-sell)",
    oferta_recomendada: "Movistar Total Fibra 1Gbps",
    es_movistar_total: true,
    score_aceptacion: 0.68,
    motivo: "Tiene una excelente experiencia con la Fibra Óptica en su hogar y su grupo familiar utiliza prepagos en otros operadores.",
    canal_sugerido: "Tienda",
    momento_sugerido: "Fin de semana",
    badges: ["elegible_mt", "cross_sell"],
    riesgo_churn: "bajo"
  },
  {
    cliente_id: "CLI000055",
    nombre_display: "Cliente #055",
    prioridad: "media",
    motivo_prioridad: "Consultó cobertura Movistar TV en zona habilitada",
    oferta_recomendada: "Dúo Fibra 500Mbps + TV",
    es_movistar_total: false,
    score_aceptacion: 0.62,
    motivo: "Revisó el paquete de contenidos deportivos en la plataforma online y reside en una zona con despliegue reciente de TV digital.",
    canal_sugerido: "Call Center",
    momento_sugerido: "Mañana",
    badges: ["interes_tv"],
    riesgo_churn: "bajo"
  },
  {
    cliente_id: "CLI000128",
    nombre_display: "Cliente #128",
    prioridad: "media",
    motivo_prioridad: "Retención preventiva por vencimiento de promo previa",
    oferta_recomendada: "Internet Hogar 200Mb",
    es_movistar_total: false,
    score_aceptacion: 0.58,
    motivo: "Su descuento inicial vence este mes. Históricamente solicita bajas cuando finalizan los periodos promocionales.",
    canal_sugerido: "Call Center",
    momento_sugerido: "Tarde",
    badges: ["vencimiento_promo"],
    riesgo_churn: "medio"
  },
  {
    cliente_id: "CLI000210",
    nombre_display: "Cliente #210",
    prioridad: "baja",
    motivo_prioridad: "Consulta de saldo habitual sin incidencias en servicio",
    oferta_recomendada: "Plan Móvil Max 50GB",
    es_movistar_total: false,
    score_aceptacion: 0.45,
    motivo: "Mantiene recargas constantes de S/25 al mes. Un plan control le brindará más gigas por un monto fijo similar.",
    canal_sugerido: "WhatsApp",
    momento_sugerido: "Cualquier momento",
    badges: ["prepago_frecuente"],
    riesgo_churn: "bajo"
  },
  {
    cliente_id: "CLI000305",
    nombre_display: "Cliente #305",
    prioridad: "baja",
    motivo_prioridad: "Cliente satisfecha con pago puntual por débito automático",
    oferta_recomendada: "Movistar Total Plus",
    es_movistar_total: true,
    score_aceptacion: 0.40,
    motivo: "Es un cliente con más de 4 años de antigüedad. Es candidato a fidelización con equipamiento adicional de cobertura.",
    canal_sugerido: "Correo / App",
    momento_sugerido: "Mañana",
    badges: ["elegible_mt", "fidelizado"],
    riesgo_churn: "bajo"
  },
  {
    cliente_id: "CLI000340",
    nombre_display: "Cliente #340",
    prioridad: "baja",
    motivo_prioridad: "Solicitud de cambio de titularidad procesada correctamente",
    oferta_recomendada: "Internet Hogar 200Mb",
    es_movistar_total: false,
    score_aceptacion: 0.35,
    motivo: "Acaba de completar un trámite administrativo sin problemas. Conviene afiliarlo a débito automático para asegurar puntualidad.",
    canal_sugerido: "Tienda",
    momento_sugerido: "Inmediato",
    badges: ["tramite_reciente"],
    riesgo_churn: "bajo"
  }
];

export const MOCK_CLIENTES = MOCK_CLIENTES_FICHAS;

export interface HistorialItem {
  id: string;
  cliente_id: string;
  nombre_display: string;
  oferta_presentada: string;
  resultado: 'aceptada' | 'rechazada' | 'mostrada';
  canal: string;
  fecha: string;
}

export const MOCK_HISTORIAL_REAL: HistorialItem[] = [
  {
    id: "HIS-101",
    cliente_id: "CLI000042",
    nombre_display: "Cliente #042",
    oferta_presentada: "Movistar Total Plus",
    resultado: "aceptada",
    canal: "Tienda",
    fecha: "Hoy, 16:45"
  },
  {
    id: "HIS-102",
    cliente_id: "CLI000019",
    nombre_display: "Cliente #019",
    oferta_presentada: "Plan Móvil Max 50GB",
    resultado: "aceptada",
    canal: "Call Center",
    fecha: "Hoy, 15:30"
  },
  {
    id: "HIS-103",
    cliente_id: "CLI000087",
    nombre_display: "Cliente #087",
    oferta_presentada: "Renovación Smartphone 5G",
    resultado: "mostrada",
    canal: "Tienda",
    fecha: "Hoy, 14:10"
  },
  {
    id: "HIS-104",
    cliente_id: "CLI000064",
    nombre_display: "Cliente #064",
    oferta_presentada: "Plan Móvil Max 50GB",
    resultado: "rechazada",
    canal: "SMS / App",
    fecha: "Hoy, 12:15"
  },
  {
    id: "HIS-105",
    cliente_id: "CLI000103",
    nombre_display: "Cliente #103",
    oferta_presentada: "Movistar Total Fibra 1Gbps",
    resultado: "aceptada",
    canal: "Tienda",
    fecha: "Ayer, 17:20"
  },
  {
    id: "HIS-106",
    cliente_id: "CLI000055",
    nombre_display: "Cliente #055",
    oferta_presentada: "Dúo Fibra 500Mbps + TV",
    resultado: "mostrada",
    canal: "Call Center",
    fecha: "Ayer, 11:45"
  },
  {
    id: "HIS-107",
    cliente_id: "CLI000128",
    nombre_display: "Cliente #128",
    oferta_presentada: "Internet Hogar 200Mb",
    resultado: "aceptada",
    canal: "Call Center",
    fecha: "Ayer, 10:05"
  },
  {
    id: "HIS-108",
    cliente_id: "CLI000210",
    nombre_display: "Cliente #210",
    oferta_presentada: "Plan Móvil Max 50GB",
    resultado: "rechazada",
    canal: "WhatsApp",
    fecha: "05 Ago, 16:00"
  }
];

export const MOCK_HISTORIAL_INITIAL = MOCK_HISTORIAL_REAL;
