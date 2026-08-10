'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PriorityBadge } from '@/components/PriorityBadge';
import { AdvisorChat } from '@/components/AdvisorChat';
import { getSyntheticClientDetail, ClienteDetailItem } from '@/data/mockData';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Eye,
  Zap,
  Lightbulb,
  Bot
} from 'lucide-react';

interface ClientDetailProps {
  params: Promise<{ id: string }>;
}

export default function ClientDetailPage({ params }: ClientDetailProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const clientId = resolvedParams.id;

  const [loading, setLoading] = useState<boolean>(true);
  const [clientData, setClientData] = useState<ClienteDetailItem | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);
  const [mobileChatOpen, setMobileChatOpen] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    // Simulate 300ms calculation delay
    const timer = setTimeout(() => {
      const detail = getSyntheticClientDetail(clientId);
      setClientData(detail);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [clientId]);

  const handleAction = (actionLabel: 'mostrada' | 'aceptada' | 'rechazada') => {
    if (submittingAction || !clientData) return;
    setSubmittingAction(true);

    const actionTextMap = {
      mostrada: 'Oferta mostrada',
      aceptada: 'Aceptada',
      rechazada: 'Rechazada'
    };

    setToastMessage(`✓ Registrado: ${actionTextMap[actionLabel]} para ${clientData.nombre_display}`);

    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  if (loading || !clientData) {
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

  const scorePercent = Math.round(clientData.score_aceptacion * 100);

  const renderBadge = (tag: string) => {
    switch (tag) {
      case 'elegible_mt':
        return (
          <span key={tag} className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
            <span>🎯 Elegible Movistar Total</span>
          </span>
        );
      case 'contactado_3x':
        return (
          <span key={tag} className="inline-flex items-center space-x-1.5 bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
            <span>🔁 Ya contactado 3 veces este mes</span>
          </span>
        );
      case 'riesgo_churn_alto':
        return (
          <span key={tag} className="inline-flex items-center space-x-1.5 bg-red-100 text-red-900 border border-red-300 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
            <span>⚠️ Riesgo de fuga</span>
          </span>
        );
      case 'riesgo_churn_medio':
        return (
          <span key={tag} className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
            <span>⚠️ Riesgo de fuga medio</span>
          </span>
        );
      default:
        return (
          <span key={tag} className="inline-flex items-center space-x-1 bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-1 rounded-full text-xs font-bold">
            <span>#{tag}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 relative min-h-[calc(100vh-4.5rem)]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#001D42] text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-150">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <span className="font-extrabold text-sm sm:text-base">{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        
        {/* Left Column: Client Cockpit */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4 md:space-y-5">
          
          {/* Header Row */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="p-1.5 rounded-lg text-gray-500 hover:text-blue-900 hover:bg-gray-100 transition-colors"
                title="Volver a la Cola"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  {clientData.cliente_id}
                </span>
                <h1 className="text-lg md:text-xl font-extrabold text-gray-900">
                  {clientData.nombre_display}
                </h1>
              </div>
            </div>

            <PriorityBadge prioridad={clientData.prioridad || 'alta'} size="md" />
          </div>

          {/* Main Card Block */}
          <div className={`rounded-2xl p-5 md:p-6 shadow-md border transition-all ${
            clientData.es_movistar_total
              ? 'bg-gradient-to-br from-[#002E66] via-[#003B80] to-[#001D42] text-white border-emerald-400/40 ring-1 ring-emerald-500/30'
              : 'bg-white text-gray-900 border-gray-200'
          }`}>
            
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                clientData.es_movistar_total
                  ? 'bg-emerald-500 text-emerald-950 font-black flex items-center space-x-1 shadow-sm'
                  : 'bg-blue-100 text-blue-900 font-bold'
              }`}>
                {clientData.es_movistar_total ? '✨ Oferta Destacada Movistar Total' : 'Recomendación IQ'}
              </span>

              <div className="flex items-center space-x-1 text-xs font-bold">
                <span className={clientData.es_movistar_total ? 'text-blue-200' : 'text-gray-500'}>
                  Probabilidad Aceptación:
                </span>
                <span className={`text-sm font-black ${
                  clientData.es_movistar_total ? 'text-emerald-400' : 'text-emerald-700'
                }`}>
                  {scorePercent}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className={`text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-none ${
                clientData.es_movistar_total
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-amber-200 drop-shadow-sm'
                  : 'text-blue-950'
              }`}>
                {clientData.oferta_recomendada}
              </h2>

              <div className="w-full bg-gray-200/40 h-3 rounded-full overflow-hidden p-0.5 border border-white/20">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    scorePercent >= 75
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-300'
                      : scorePercent >= 50
                      ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                      : 'bg-gradient-to-r from-gray-500 to-gray-400'
                  }`}
                  style={{ width: `${scorePercent}%` }}
                ></div>
              </div>

              <div className={`p-3.5 rounded-xl text-sm font-medium leading-relaxed ${
                clientData.es_movistar_total
                  ? 'bg-blue-950/60 border border-blue-400/20 text-blue-100'
                  : 'bg-gray-50 border border-gray-200 text-gray-800'
              }`}>
                <p className="italic">
                  "{clientData.motivo}"
                </p>
              </div>
            </div>

          </div>

          {/* Contextual Badges Row */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 block">
              Contexto del Cliente
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {clientData.badges && clientData.badges.length > 0 ? (
                clientData.badges.map((b) => renderBadge(b))
              ) : (
                <span className="text-xs text-gray-500">Sin etiquetas adicionales</span>
              )}
            </div>
          </div>

          {/* "Cómo ofrecerla" Tip + Voice Pitch Script */}
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center space-x-3 shadow-sm">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="text-xs md:text-sm font-semibold text-amber-900">
                <span className="font-extrabold text-amber-950 uppercase tracking-wide mr-1">
                  💡 Tip de Atención:
                </span>
                <span>Canal sugerido: </span>
                <span className="font-extrabold text-amber-950">{clientData.canal_sugerido}</span>
                <span className="mx-1 font-bold">•</span>
                <span>Momento sugerido: </span>
                <span className="font-extrabold text-amber-950">{clientData.momento_sugerido}</span>
              </div>
            </div>

            {clientData.guion && (
              <div className="bg-blue-950 text-white p-4 rounded-xl border border-blue-800 space-y-1.5 shadow-sm">
                <span className="text-xs font-black uppercase tracking-wider text-blue-300 flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guión de Venta Recomendado (Lectura en Voz Alta)</span>
                </span>
                <p className="text-xs sm:text-sm font-medium text-blue-50 italic leading-relaxed">
                  "{clientData.guion}"
                </p>
              </div>
            )}
          </div>

          {/* Three Action Buttons */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block text-center md:text-left">
              Acción Comercial Inmediata
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                disabled={submittingAction}
                onClick={() => handleAction('mostrada')}
                className="w-full flex items-center justify-center space-x-2 bg-[#0050B5] hover:bg-[#019BDE] text-white font-extrabold py-3.5 px-4 rounded-xl shadow transition-all transform active:scale-95 text-sm md:text-base border border-blue-700 disabled:opacity-50"
              >
                <Eye className="w-5 h-5" />
                <span>Oferta mostrada</span>
              </button>

              <button
                disabled={submittingAction}
                onClick={() => handleAction('aceptada')}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow transition-all transform active:scale-95 text-sm md:text-base border border-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Aceptada</span>
              </button>

              <button
                disabled={submittingAction}
                onClick={() => handleAction('rechazada')}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow transition-all transform active:scale-95 text-sm md:text-base border border-red-700 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                <span>Rechazada</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (Desktop Sidebar Panel) */}
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

      {/* Floating Action Button (Mobile FAB) */}
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

      {/* Mobile Drawer Overlay */}
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
