export interface ClienteQueueItem {
  cliente_id: string;
  nombre_display: string;
  prioridad: 'alta' | 'media' | 'baja';
  motivo_prioridad: string;
  score_aceptacion: number;
  riesgo_churn: 'alto' | 'medio' | 'bajo';
  brecha_mt: boolean;
  gap_hogar_movil: boolean;
  fatiga_oferta: boolean;
}

export interface ClienteDetailItem {
  cliente_id: string;
  nombre_display: string;
  oferta_recomendada: string;
  oferta_id: string;
  es_movistar_total: boolean;
  score_aceptacion: number;
  prioridad: 'alta' | 'media' | 'baja';
  motivo: string;
  guion: string;
  canal_sugerido: string;
  momento_sugerido: string;
  badges: string[];
}

export interface PanoramaGeneralData {
  resumen: {
    total_clientes: number;
    oportunidad_mt: number;
    cross_sell_disponible: number;
    riesgo_alto: number;
  };
  campanas: {
    id: string;
    nombre: string;
    descripcion: string;
    total: number;
  }[];
}

export interface HistorialInteraction {
  id: string;
  cliente_id: string;
  nombre_display: string;
  oferta: string;
  resultado: 'aceptada' | 'rechazada' | 'mostrada';
  canal: string;
  fecha: string;
}

// 1. Synthetic Priority Queue Dataset (15 Clients)
export const MOCK_CLIENTES_COLA: ClienteQueueItem[] = [
  {
    cliente_id: 'CLI002483',
    nombre_display: 'Cliente #2483',
    prioridad: 'alta',
    motivo_prioridad: 'Riesgo de fuga alto + candidato a Movistar Total (Paquete Seguridad Digital)',
    score_aceptacion: 1.0,
    riesgo_churn: 'alto',
    brecha_mt: true,
    gap_hogar_movil: false,
    fatiga_oferta: true
  },
  {
    cliente_id: 'CLI080443',
    nombre_display: 'Cliente #80443',
    prioridad: 'alta',
    motivo_prioridad: 'Riesgo de fuga alto + candidato a Movistar Total (Upgrade a Plan Plus)',
    score_aceptacion: 0.76,
    riesgo_churn: 'alto',
    brecha_mt: true,
    gap_hogar_movil: false,
    fatiga_oferta: false
  },
  {
    cliente_id: 'CLI052155',
    nombre_display: 'Cliente #52155',
    prioridad: 'alta',
    motivo_prioridad: 'Riesgo de fuga alto + candidato a Movistar Total (Plan Movil Max 50GB)',
    score_aceptacion: 0.73,
    riesgo_churn: 'alto',
    brecha_mt: true,
    gap_hogar_movil: true,
    fatiga_oferta: false
  },
  {
    cliente_id: 'CLI025403',
    nombre_display: 'Cliente #25403',
    prioridad: 'alta',
    motivo_prioridad: 'Riesgo de fuga alto + candidato a Movistar Total (Internet Hogar 200Mb)',
    score_aceptacion: 0.70,
    riesgo_churn: 'alto',
    brecha_mt: true,
    gap_hogar_movil: true,
    fatiga_oferta: true
  },
  {
    cliente_id: 'CLI084107',
    nombre_display: 'Cliente #84107',
    prioridad: 'alta',
    motivo_prioridad: 'Riesgo de fuga medio + candidato a Movistar Total (Paquete Seguridad Digital)',
    score_aceptacion: 1.0,
    riesgo_churn: 'medio',
    brecha_mt: true,
    gap_hogar_movil: false,
    fatiga_oferta: false
  },
  {
    cliente_id: 'CLI043624',
    nombre_display: 'Cliente #43624',
    prioridad: 'alta',
    motivo_prioridad: 'Alta probabilidad de aceptar Paquete Seguridad Digital + riesgo de fuga alto',
    score_aceptacion: 1.0,
    riesgo_churn: 'alto',
    brecha_mt: false,
    gap_hogar_movil: true,
    fatiga_oferta: true
  },
  {
    cliente_id: 'CLI049934',
    nombre_display: 'Cliente #49934',
    prioridad: 'alta',
    motivo_prioridad: 'Candidato convergente Movistar Total Basico (53% probabilidad)',
    score_aceptacion: 0.53,
    riesgo_churn: 'medio',
    brecha_mt: true,
    gap_hogar_movil: true,
    fatiga_oferta: false
  },
  {
    cliente_id: 'CLI016228',
    nombre_display: 'Cliente #16228',
    prioridad: 'alta',
    motivo_prioridad: 'Candidato preferencial Movistar Total Plus (65% probabilidad)',
    score_aceptacion: 0.65,
    riesgo_churn: 'bajo',
    brecha_mt: true,
    gap_hogar_movil: true,
    fatiga_oferta: false
  },
  {
    cliente_id: 'CLI071826',
    nombre_display: 'Cliente #71826',
    prioridad: 'media',
    motivo_prioridad: 'Afinidad media a Movistar Total Plus en canal Digital',
    score_aceptacion: 0.32,
    riesgo_churn: 'medio',
    brecha_mt: false,
    gap_hogar_movil: true,
    fatiga_oferta: false
  },
  {
    cliente_id: 'CLI059567',
    nombre_display: 'Cliente #59567',
    prioridad: 'media',
    motivo_prioridad: 'Consumo elevado de datos, candidato a Movistar Total Max',
    score_aceptacion: 0.40,
    riesgo_churn: 'medio',
    brecha_mt: true,
    gap_hogar_movil: false,
    fatiga_oferta: false
  },
  {
    cliente_id: 'CLI042084',
    nombre_display: 'Cliente #42084',
    prioridad: 'media',
    motivo_prioridad: 'Monoservicio móvil candidato a Plan Movil Ilimitado',
    score_aceptacion: 0.38,
    riesgo_churn: 'bajo',
    brecha_mt: false,
    gap_hogar_movil: true,
    fatiga_oferta: false
  },
  {
    cliente_id: 'CLI036735',
    nombre_display: 'Cliente #36735',
    prioridad: 'media',
    motivo_prioridad: 'Alta propensión a convergencia Movistar Total Plus en tienda',
    score_aceptacion: 0.64,
    riesgo_churn: 'bajo',
    brecha_mt: true,
    gap_hogar_movil: true,
    fatiga_oferta: false
  },
  {
    cliente_id: 'CLI052984',
    nombre_display: 'Cliente #52984',
    prioridad: 'baja',
    motivo_prioridad: 'Baja actividad reciente, candidato a Equipo Smartphone Gama Media',
    score_aceptacion: 0.25,
    riesgo_churn: 'bajo',
    brecha_mt: false,
    gap_hogar_movil: true,
    fatiga_oferta: false
  },
  {
    cliente_id: 'CLI062968',
    nombre_display: 'Cliente #62968',
    prioridad: 'baja',
    motivo_prioridad: 'Perfil conservador postpago con baja respuesta histórica',
    score_aceptacion: 0.20,
    riesgo_churn: 'bajo',
    brecha_mt: false,
    gap_hogar_movil: false,
    fatiga_oferta: false
  },
  {
    cliente_id: 'CLI035740',
    nombre_display: 'Cliente #35740',
    prioridad: 'baja',
    motivo_prioridad: 'Monoservicio hogar candidato a Internet + Fijo Hogar',
    score_aceptacion: 0.18,
    riesgo_churn: 'bajo',
    brecha_mt: false,
    gap_hogar_movil: true,
    fatiga_oferta: false
  }
];

// 2. Synthetic Customer Details Dictionary
export const MOCK_CLIENTES_DETALLE: Record<string, ClienteDetailItem> = {
  CLI002483: {
    cliente_id: 'CLI002483',
    nombre_display: 'Cliente #2483',
    oferta_recomendada: 'Paquete Seguridad Digital',
    oferta_id: 'OF018',
    es_movistar_total: true,
    score_aceptacion: 1.0,
    prioridad: 'alta',
    motivo: 'Cliente con 100% de probabilidad de aceptación para Paquete Seguridad Digital y nivel de riesgo alto por alto consumo.',
    guion: 'Hola, detectamos que eres un cliente preferencial en Movistar. Hoy tenemos una oferta especial para actualizar tu plan a Paquete Seguridad Digital con beneficios exclusivos inmediatos.',
    canal_sugerido: 'Digital',
    momento_sugerido: 'Mañana',
    badges: ['elegible_mt', 'riesgo_churn_alto', 'contactado_3x']
  },
  CLI080443: {
    cliente_id: 'CLI080443',
    nombre_display: 'Cliente #80443',
    oferta_recomendada: 'Upgrade a Plan Plus',
    oferta_id: 'OF011',
    es_movistar_total: true,
    score_aceptacion: 0.76,
    prioridad: 'alta',
    motivo: 'Cliente con 76% de probabilidad de aceptación para Upgrade a Plan Plus y riesgo de fuga alto por consumo de gigas cercano al límite.',
    guion: 'Hola, notamos que estás consumiendo el 90% de tus gigas antes de fin de mes. Te ofrecemos pasar a Plan Plus con el doble de velocidad por una diferencia mínima.',
    canal_sugerido: 'Tienda',
    momento_sugerido: 'Tarde',
    badges: ['elegible_mt', 'riesgo_churn_alto', 'contactado_3x']
  },
  CLI052155: {
    cliente_id: 'CLI052155',
    nombre_display: 'Cliente #52155',
    oferta_recomendada: 'Plan Movil Max 50GB',
    oferta_id: 'OF003',
    es_movistar_total: true,
    score_aceptacion: 0.73,
    prioridad: 'alta',
    motivo: 'Cliente con 73% de probabilidad de aceptación para Plan Movil Max 50GB y alto potencial de fidelización.',
    guion: 'Hola, eres cliente preferencial Movistar y hoy tienes habilitado el cambio a Plan Max 50GB con beneficio exclusivo en navegación.',
    canal_sugerido: 'Call In',
    momento_sugerido: 'Mañana',
    badges: ['elegible_mt', 'riesgo_churn_alto', 'contactado_3x']
  },
  CLI049934: {
    cliente_id: 'CLI049934',
    nombre_display: 'Cliente #49934',
    oferta_recomendada: 'Movistar Total Basico',
    oferta_id: 'OF020',
    es_movistar_total: true,
    score_aceptacion: 0.53,
    prioridad: 'alta',
    motivo: 'Cliente con 53% de probabilidad de aceptación para Movistar Total Basico y nivel de riesgo medio.',
    guion: 'Hola, identificamos que cuentas con servicio móvil y hogar por separado. Hoy te ofrecemos unificarlos en Movistar Total Básico con 20% de descuento mensual.',
    canal_sugerido: 'Tienda',
    momento_sugerido: 'Mañana',
    badges: ['elegible_mt', 'riesgo_churn_medio', 'contactado_3x']
  },
  CLI016228: {
    cliente_id: 'CLI016228',
    nombre_display: 'Cliente #16228',
    oferta_recomendada: 'Movistar Total Plus',
    oferta_id: 'OF021',
    es_movistar_total: true,
    score_aceptacion: 0.65,
    prioridad: 'alta',
    motivo: 'Cliente con 65% de probabilidad de aceptación para Movistar Total Plus y nivel de riesgo bajo.',
    guion: 'Hola, queremos agradecer tu fidelidad en Movistar ofreciéndote el paquete convergente Movistar Total Plus con fibra óptica y bolsas de gigas compartidas.',
    canal_sugerido: 'Digital',
    momento_sugerido: 'Tarde',
    badges: ['elegible_mt', 'riesgo_churn_bajo', 'contactado_3x']
  }
};

// Default Fallback Detail Generator for any unlisted ID
export function getSyntheticClientDetail(id: string): ClienteDetailItem {
  if (MOCK_CLIENTES_DETALLE[id]) {
    return MOCK_CLIENTES_DETALLE[id];
  }

  const queueItem = MOCK_CLIENTES_COLA.find((c) => c.cliente_id === id);
  const numClean = id.replace('CLI', '').replace(/^0+/, '');
  const display = `Cliente #${numClean.padStart(3, '0')}`;
  const isMT = queueItem ? queueItem.brecha_mt : true;
  const offerName = queueItem ? queueItem.motivo_prioridad.split('(')[1]?.replace(')', '') || 'Movistar Total Plus' : 'Movistar Total Plus';

  return {
    cliente_id: id,
    nombre_display: display,
    oferta_recomendada: offerName,
    oferta_id: 'OF021',
    es_movistar_total: isMT,
    score_aceptacion: queueItem ? queueItem.score_aceptacion : 0.65,
    prioridad: queueItem ? queueItem.prioridad : 'alta',
    motivo: queueItem ? queueItem.motivo_prioridad : 'Cliente preferencial seleccionado por el motor inteligente de propensión Movistar IQ.',
    guion: `Hola, identificamos que eres un cliente preferencial en Movistar. Hoy tenemos activa una promoción especial para actualizar tu plan a ${offerName} con beneficios exclusivos inmediatos.`,
    canal_sugerido: 'Tienda',
    momento_sugerido: 'Mañana',
    badges: isMT ? ['elegible_mt', 'riesgo_churn_medio', 'contactado_3x'] : ['riesgo_churn_medio', 'contactado_3x']
  };
}

// 3. Synthetic Panorama General Summary & Campaigns
export const MOCK_PANORAMA_GENERAL: PanoramaGeneralData = {
  resumen: {
    total_clientes: 100000,
    oportunidad_mt: 4138,
    cross_sell_disponible: 54758,
    riesgo_alto: 848
  },
  campanas: [
    {
      id: 'brecha_mt',
      nombre: 'Oportunidad Movistar Total',
      descripcion: 'Clientes elegibles que nunca aceptaron MT',
      total: 4138
    },
    {
      id: 'cross_sell',
      nombre: 'Cross-sell Hogar/Móvil',
      descripcion: 'Clientes con solo uno de los dos servicios',
      total: 54758
    },
    {
      id: 'retencion',
      nombre: 'Riesgo de Fuga',
      descripcion: 'Riesgo alto o fatiga de oferta sin conversión',
      total: 12957
    }
  ]
};

// 4. Synthetic History Dataset
export const MOCK_HISTORIAL: HistorialInteraction[] = [
  { id: 'HIS-101', cliente_id: 'CLI002483', nombre_display: 'Cliente #2483', oferta: 'Paquete Seguridad Digital', resultado: 'aceptada', canal: 'Digital', fecha: '2026-08-08 10:21' },
  { id: 'HIS-102', cliente_id: 'CLI080443', nombre_display: 'Cliente #80443', oferta: 'Upgrade a Plan Plus', resultado: 'mostrada', canal: 'Tienda', fecha: '2026-08-08 09:45' },
  { id: 'HIS-103', cliente_id: 'CLI052155', nombre_display: 'Cliente #52155', oferta: 'Plan Movil Max 50GB', resultado: 'aceptada', canal: 'Call In', fecha: '2026-08-07 16:30' },
  { id: 'HIS-104', cliente_id: 'CLI025403', nombre_display: 'Cliente #25403', oferta: 'Internet Hogar 200Mb', resultado: 'rechazada', canal: 'Tienda', fecha: '2026-08-07 14:15' },
  { id: 'HIS-105', cliente_id: 'CLI049934', nombre_display: 'Cliente #49934', oferta: 'Movistar Total Basico', resultado: 'aceptada', canal: 'Tienda', fecha: '2026-08-06 11:20' },
  { id: 'HIS-106', cliente_id: 'CLI016228', nombre_display: 'Cliente #16228', oferta: 'Movistar Total Plus', resultado: 'mostrada', canal: 'Digital', fecha: '2026-08-06 09:10' }
];

// 5. Synthetic Chatbot Response Generator (No Backend Needed)
export function getSyntheticChatResponse(cliente_id: string, oferta: string, pregunta: string): string {
  const p = pregunta.toLowerCase().trim();

  if (p.includes('hola') || p.includes('buenas') || p.includes('quien eres') || p.includes('quién eres')) {
    return `👋 **¡Hola! Soy tu Copiloto Movistar IQ**.\n- Estoy listo para ayudarte a cerrar la recomendación de **${oferta}** para el cliente **${cliente_id}**.\n- Puedo darte argumentos de precio, beneficios de conectividad o estrategias para manejo de objeciones. ¿En qué te ayudo?`;
  }
  if (p.includes('caro') || p.includes('precio') || p.includes('costo') || p.includes('descuento')) {
    return `💡 **Técnica de Precio para ${oferta}**:\n- **Desglosa el costo diario**: Equivale a menos de S/ 2.50 adicionales por día.\n- **Ahorro por Gigas**: Evita que el cliente compre paquetes adicionales a fin de mes.\n- **Beneficio Hoy**: Recuérdale que la activación es inmediata y sin costo de instalación.`;
  }
  if (p.includes('fuga') || p.includes('riesgo') || p.includes('churn') || p.includes('baja') || p.includes('irse')) {
    return `⚠️ **Análisis de Riesgo de Fuga**:\n- El cliente muestra riesgo por patrones históricos de sobreconsumo o antigüedad en su plan actual.\n- **Estrategia**: Presenta ${oferta} como una atención de fidelización preferencial antes de que solicite la baja.`;
  }
  if (p.includes('beneficio') || p.includes('ventaja') || p.includes('por que') || p.includes('por qué') || p.includes('giga')) {
    return `🎯 **3 Beneficios Clave para ${oferta}**:\n- **Bolsa Ampliada de Gigas**: Conexión continua sin cortes ni degradación de velocidad.\n- **Prioridad de Red**: Mejor experiencia en zonas de alta demanda.\n- **Sin Trámites**: Mantiene el mismo número y chip actual.`;
  }

  return `🤖 **Sugerencia Comercial (${oferta})**:\n- Para tu consulta *"${pregunta}"*: enfócate en el beneficio inmediato de ${oferta}.\n- Haz una pregunta de cierre directo: *'¿Desea que le activemos la mejora de plan desde hoy mismo?'*`;
}
