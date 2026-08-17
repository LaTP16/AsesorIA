'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PriorityBadge } from '@/components/PriorityBadge';
import { AdvisorChat } from '@/components/AdvisorChat';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Zap,
  Lightbulb,
  ShieldAlert,
  ServerOff,
  RefreshCw,
  MessageSquare,
  Bot,
  X
} from 'lucide-react';

interface ClientDetailProps {
  params: Promise<{ id: string }>;
}

export interface ClienteDetailAPIResponse {
  cliente_id: string;
  nombre_display: string;
  oferta_recomendada: string;
  oferta_id?: string;
  es_movistar_total: boolean;
  score_aceptacion: number;
  prioridad: 'alta' | 'media' | 'baja';
  motivo: string;
  guion: string;
  canal_sugerido: string;
  momento_sugerido: string;
  badges: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ClientDetailPage({ params }: ClientDetailProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const clientId = resolvedParams.id;

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [is404, setIs404] = useState<boolean>(false);
  const [clientData, setClientData] = useState<ClienteDetailAPIResponse | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  // State for mobile drawer chat overlay
  const [mobileChatOpen, setMobileChatOpen] = useState<boolean>(false);

  const fetchCliente = async () => {
    setLoading(true);
    setErrorMsg(null);
    setIs404(false);
    try {
      const res = await fetch(`${API_BASE_URL}/cliente/${clientId}`);
      if (res.status === 404) {
        setIs404(true);
        setErrorMsg(`Cliente ID '${clientId}' no fue encontrado en la base de datos.`);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: Error al obtener datos del cliente.`);
      }
      const data: ClienteDetailAPIResponse = await res.json();
      setClientData(data);
    } catch (err: any) {
      console.error('Error cargando detalle de cliente:', err);
      setErrorMsg('No se pudo conectar con el servidor backend (http://localhost:8000). Verifique que la API FastAPI está corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCliente();
  }, [clientId]);

  const handleAction = async (actionLabel: 'mostrada' | 'aceptada' | 'rechazada') => {
    if (submittingAction || !clientData) return;
    setSubmittingAction(true);

    const actionTextMap = {
      mostrada: 'Oferta mostrada',
      aceptada: 'Aceptada',
      rechazada: 'Rechazada'
    };

    try {
      await fetch(`${API_BASE_URL}/registrar-interaccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clientData.cliente_id,
          oferta_id: clientData.oferta_id || clientData.oferta_recomendada,
          resultado: actionLabel,
          notas_asesor: `Registrado desde Ficha de Recomendación AsesorIA`
        })
      });
    } catch (err) {
      console.warn('Registro local de respaldo:', err);
    }

    setToastMessage(`✓ Registrado: ${actionTextMap[actionLabel]} para ${clientData.nombre_display}`);

    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center space-y-4 p-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-[#019BDE] animate-spin"></div>
          <Zap className="w-6 h-6 text-[#0050B5] absolute animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-black text-blue-950 tracking-tight">Analizando cliente...</h2>
          <p className="text-xs font-semibold text-gray-500">
            Calculando modelo de propensión e inferencia IQ para <span className="font-mono text-blue-900">{clientId}</span>
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !clientData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        {is404 ? (
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto" />
        ) : (
          <ServerOff className="w-16 h-16 text-red-500 mx-auto" />
        )}
        <h1 className="text-2xl font-black text-gray-800">
          {is404 ? 'Cliente no encontrado' : 'Error de Conexión'}
        </h1>
        <p className="text-sm text-gray-600 font-medium">
          {errorMsg || 'Ocurrió un problema de comunicación con el backend de AsesorIA.'}
        </p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          {!is404 && (
            <button
              onClick={fetchCliente}
              className="inline-flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-900 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
          )}
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-[#0050B5] hover:bg-[#019BDE] text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Cola</span>
          </Link>
        </div>
      </div>
    );
  }

  const scorePercent = Math.round(clientData.score_aceptacion * 100);

  const renderBadge = (tag: string) => {
    switch (tag) {
      case 'elegible_mt':
        return (
          <span key={tag} className="inline-flex items-center space-x-1.5 bg-[#EDF3EC] text-[#448361] border border-[#CBE0D1] px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <span>🎯 Elegible Movistar Total</span>
          </span>
        );
      case 'contactado_3x':
        return (
          <span key={tag} className="inline-flex items-center space-x-1.5 bg-[#E8F3F7] text-[#017BAE] border border-[#C8E3ED] px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <span>🔁 Ya contactado 3 veces este mes</span>
          </span>
        );
      case 'riesgo_churn_alto':
        return (
          <span key={tag} className="inline-flex items-center space-x-1.5 bg-[#FDEBEC] text-[#EB5757] border border-[#F7C1C1] px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <span>⚠️ Riesgo de fuga alto</span>
          </span>
        );
      case 'riesgo_churn_medio':
        return (
          <span key={tag} className="inline-flex items-center space-x-1.5 bg-[#FBF3DB] text-[#D9730D] border border-[#F5E0B3] px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <span>⚠️ Riesgo de fuga medio</span>
          </span>
        );
      default:
        return (
          <span key={tag} className="inline-flex items-center space-x-1 bg-[#F1F1EF] text-[#787774] border border-[#E3E2E0] px-2 py-0.5 rounded-md text-xs font-medium">
            <span>#{tag}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 relative min-h-[calc(100vh-4.5rem)]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#37352F] text-white px-5 py-2.5 rounded-lg shadow-xl border border-emerald-400 flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-4 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="font-bold text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        
        {/* Left Column: Main Client Recommendation Cockpit */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Top Header Row */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-[#E3E2E0] shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="p-1.5 rounded-md text-[#787774] hover:text-[#37352F] hover:bg-[#F1F0EC] transition-colors"
                title="Volver a la Cola"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#37352F] bg-[#F1F1EF] px-2 py-0.5 rounded border border-[#E3E2E0]">
                  {clientData.cliente_id}
                </span>
                <h1 className="text-base md:text-lg font-extrabold text-[#37352F]">
                  {clientData.nombre_display}
                </h1>
              </div>
            </div>

            <PriorityBadge prioridad={clientData.prioridad || 'alta'} size="md" />
          </div>

          {/* Main Block */}
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-[0_1px_2px_rgba(15,15,15,0.06)] border border-[#E3E2E0] text-[#37352F]">
            
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                clientData.es_movistar_total
                  ? 'bg-[#E8F3F7] text-[#017BAE] border-[#C8E3ED] flex items-center space-x-1'
                  : 'bg-[#F1F1EF] text-[#787774] border-[#E3E2E0]'
              }`}>
                {clientData.es_movistar_total ? '✨ Oferta Destacada Movistar Total' : 'Recomendación IQ'}
              </span>

              <div className="flex items-center space-x-1 text-xs font-semibold">
                <span className="text-[#787774]">Probabilidad Aceptación:</span>
                <span className="text-sm font-black text-[#448361]">{scorePercent}%</span>
              </div>
            </div>

            {/* Big Offer Name */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#37352F] tracking-tight leading-snug">
                {clientData.oferta_recomendada}
              </h2>

              {/* Visual Probability Gauge Bar */}
              <div className="w-full bg-[#F1F1EF] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#E3E2E0]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    scorePercent >= 75
                      ? 'bg-[#448361]'
                      : scorePercent >= 50
                      ? 'bg-[#D9730D]'
                      : 'bg-[#787774]'
                  }`}
                  style={{ width: `${scorePercent}%` }}
                ></div>
              </div>

              {/* Natural Language Short Explanation */}
              <div className="p-3.5 rounded-md bg-[#FAF9F6] border border-[#E3E2E0] text-xs sm:text-sm font-medium leading-relaxed text-[#37352F]">
                <p className="italic">
                  "{clientData.motivo}"
                </p>
              </div>
            </div>

          </div>

          {/* Contextual Badges Row */}
          <div className="bg-white p-3.5 rounded-lg border border-[#E3E2E0] shadow-[0_1px_2px_rgba(15,15,15,0.04)] space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#787774] block">
              Contexto del Cliente
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {clientData.badges && clientData.badges.length > 0 ? (
                clientData.badges.map((b) => renderBadge(b))
              ) : (
                <span className="text-xs text-[#9B9A97]">Sin etiquetas adicionales</span>
              )}
            </div>
          </div>

          {/* "Cómo ofrecerla" Sub-block with Advisor Pitch Script */}
          <div className="space-y-3">
            <div className="bg-[#FBF3DB] border border-[#F5E0B3] p-3 rounded-lg flex items-center space-x-3 shadow-none">
              <Lightbulb className="w-4 h-4 text-[#D9730D] flex-shrink-0" />
              <div className="text-xs font-semibold text-[#D9730D]">
                <span className="font-extrabold uppercase tracking-wide mr-1">
                  💡 Tip de Atención:
                </span>
                <span>Canal sugerido: </span>
                <span className="font-extrabold text-[#37352F]">{clientData.canal_sugerido}</span>
                <span className="mx-1 font-bold">•</span>
                <span>Momento sugerido: </span>
                <span className="font-extrabold text-[#37352F]">{clientData.momento_sugerido}</span>
              </div>
            </div>

            {clientData.guion && (
              <div className="bg-white text-[#37352F] p-4 rounded-lg border border-[#E3E2E0] space-y-1.5 shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#017BAE] flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-[#D9730D]" />
                  <span>Guión de Venta Recomendado (Lectura en Voz Alta)</span>
                </span>
                <p className="text-xs sm:text-sm font-medium text-[#37352F] italic leading-relaxed bg-[#FAF9F6] p-3 rounded-md border border-[#E3E2E0]">
                  "{clientData.guion}"
                </p>
              </div>
            )}
          </div>

          {/* Three Action Buttons of Equal Prominence */}
          <div className="bg-white p-4 rounded-lg border border-[#E3E2E0] shadow-[0_1px_2px_rgba(15,15,15,0.04)] space-y-2">
            <span className="text-xs font-bold text-[#787774] uppercase tracking-wider block text-center md:text-left">
              Acción Comercial Inmediata
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <button
                disabled={submittingAction}
                onClick={() => handleAction('mostrada')}
                className="w-full flex items-center justify-center space-x-2 bg-[#37352F] hover:bg-[#504E48] text-white font-bold py-2.5 px-4 rounded-md shadow-sm transition-colors text-xs sm:text-sm border border-[#37352F] disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                <span>Oferta mostrada</span>
              </button>

              <button
                disabled={submittingAction}
                onClick={() => handleAction('aceptada')}
                className="w-full flex items-center justify-center space-x-2 bg-[#448361] hover:bg-[#386D51] text-white font-bold py-2.5 px-4 rounded-md shadow-sm transition-colors text-xs sm:text-sm border border-[#448361] disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aceptada</span>
              </button>

              <button
                disabled={submittingAction}
                onClick={() => handleAction('rechazada')}
                className="w-full flex items-center justify-center space-x-2 bg-[#EB5757] hover:bg-[#D84545] text-white font-bold py-2.5 px-4 rounded-md shadow-sm transition-colors text-xs sm:text-sm border border-[#EB5757] disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Rechazada</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (DESKTOP ONLY ≥ lg): Persistent Copiloto Chat Sidebar in User's Red Box Area */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-20">
          <AdvisorChat
            cliente_id={clientData.cliente_id}
            nombre_display={clientData.nombre_display}
            oferta_recomendada={clientData.oferta_recomendada}
            oferta_id={clientData.oferta_id}
            isDesktopEmbedded={true}
          />
        </div>

      </div>

      {/* Floating Action Button (FAB - MOBILE ONLY < lg) in Bottom Right Corner (User Scribble Area) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setMobileChatOpen(true)}
          className="relative group bg-gradient-to-r from-[#0050B5] to-[#019BDE] text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-200 border-2 border-white flex items-center justify-center active:scale-95"
          title="Abrir Copiloto IA"
        >
          <Bot className="w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white"></span>
          </span>
        </button>
      </div>

      {/* Mobile Drawer Overlay (< lg) */}
      {mobileChatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl border border-gray-200 max-h-[90vh]">
            <AdvisorChat
              cliente_id={clientData.cliente_id}
              nombre_display={clientData.nombre_display}
              oferta_recomendada={clientData.oferta_recomendada}
              oferta_id={clientData.oferta_id}
              isDesktopEmbedded={false}
              onClose={() => setMobileChatOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
