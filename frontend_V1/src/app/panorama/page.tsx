'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/PriorityBadge';
import { MOCK_PANORAMA_GENERAL, MOCK_CLIENTES_COLA, ClienteQueueItem } from '@/data/mockData';
import {
  Users,
  Sparkles,
  ArrowRightLeft,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  ArrowLeft,
  Search,
  Filter,
  Target,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export default function PanoramaPage() {
  const overview = MOCK_PANORAMA_GENERAL;
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<'todos' | 'alta' | 'media' | 'baja'>('todos');
  const [sortBy, setSortBy] = useState<'score' | 'prioridad'>('score');

  const activeCampaignMeta = useMemo(() => {
    if (!selectedCampaignId) return null;
    return overview.campanas.find((c) => c.id === selectedCampaignId) || null;
  }, [overview, selectedCampaignId]);

  const campaignClients = useMemo(() => {
    if (!selectedCampaignId) return [];
    if (selectedCampaignId === 'brecha_mt') {
      return MOCK_CLIENTES_COLA.filter((c) => c.brecha_mt);
    }
    if (selectedCampaignId === 'cross_sell') {
      return MOCK_CLIENTES_COLA.filter((c) => c.gap_hogar_movil);
    }
    if (selectedCampaignId === 'retencion') {
      return MOCK_CLIENTES_COLA.filter((c) => c.riesgo_churn === 'alto' || c.fatiga_oferta);
    }
    return MOCK_CLIENTES_COLA;
  }, [selectedCampaignId]);

  const priorityRank: Record<string, number> = { alta: 3, media: 2, baja: 1 };

  const filteredCampaignClients = useMemo(() => {
    return campaignClients
      .filter((c) => {
        if (selectedPriorityFilter !== 'todos' && c.prioridad !== selectedPriorityFilter) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          return (
            c.cliente_id.toLowerCase().includes(q) ||
            c.nombre_display.toLowerCase().includes(q) ||
            c.motivo_prioridad.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          return b.score_aceptacion - a.score_aceptacion;
        } else {
          const rankDiff = (priorityRank[b.prioridad] || 0) - (priorityRank[a.prioridad] || 0);
          if (rankDiff !== 0) return rankDiff;
          return b.score_aceptacion - a.score_aceptacion;
        }
      });
  }, [campaignClients, searchQuery, selectedPriorityFilter, sortBy]);

  const campaignPriorityCounts = useMemo(() => {
    return {
      todos: campaignClients.length,
      alta: campaignClients.filter((c) => c.prioridad === 'alta').length,
      media: campaignClients.filter((c) => c.prioridad === 'media').length,
      baja: campaignClients.filter((c) => c.prioridad === 'baja').length,
    };
  }, [campaignClients]);

  const handleSelectCampaign = (campanaId: string) => {
    setSelectedCampaignId(campanaId);
    setSearchQuery('');
    setSelectedPriorityFilter('todos');
    setSortBy('score');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#002E66] text-white p-4 sm:p-5 rounded-xl shadow-md border border-[#0050B5]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-[#019BDE]" />
            <span>Panorama Comercial del Parque • Versión Sintética V1</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {selectedCampaignId && activeCampaignMeta
              ? activeCampaignMeta.nombre
              : 'Panorama General de Campañas'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
            {selectedCampaignId && activeCampaignMeta
              ? activeCampaignMeta.descripcion
              : 'Visión estratégica de oportunidades de venta convergente, cross-sell y retención.'}
          </p>
        </div>

        {selectedCampaignId && (
          <button
            onClick={() => setSelectedCampaignId(null)}
            className="flex items-center space-x-2 bg-[#019BDE] hover:bg-[#0082BD] text-white font-extrabold px-4 py-2 rounded-lg text-xs sm:text-sm shadow transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Panorama</span>
          </button>
        )}
      </div>

      {/* Main View: Overview Dashboard (when no campaign selected) */}
      {!selectedCampaignId && (
        <div className="space-y-6">
          
          {/* SECTION 1: 4 Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Total Clientes Parque
                </span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900">
                  {overview.resumen.total_clientes.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-blue-50 text-[#0050B5] rounded-xl border border-blue-100">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  Oportunidad Movistar Total
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {overview.resumen.oportunidad_mt.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-amber-500">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Cross-sell Hogar/Móvil
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600">
                  {overview.resumen.cross_sell_disponible.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-red-500">
              <div>
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider block mb-1">
                  Riesgo Alto Churn
                </span>
                <span className="text-2xl sm:text-3xl font-black text-red-600">
                  {overview.resumen.riesgo_alto.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* SECTION 2: 3 Campaign Cards */}
          <div className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center space-x-2">
              <Target className="w-5 h-5 text-[#0050B5]" />
              <span>Campañas Comerciales Priorizadas</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {overview.campanas.map((campana) => {
                const badgeStyles: Record<string, string> = {
                  brecha_mt: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                  cross_sell: 'bg-amber-100 text-amber-900 border-amber-300',
                  retencion: 'bg-red-100 text-red-900 border-red-300'
                };

                const cardAccents: Record<string, string> = {
                  brecha_mt: 'hover:border-emerald-400 border-l-4 border-l-emerald-500',
                  cross_sell: 'hover:border-amber-400 border-l-4 border-l-amber-500',
                  retencion: 'hover:border-red-400 border-l-4 border-l-red-500'
                };

                return (
                  <div
                    key={campana.id}
                    onClick={() => handleSelectCampaign(campana.id)}
                    className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${cardAccents[campana.id] || 'hover:border-blue-400'} transition-all cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-md`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeStyles[campana.id] || 'bg-blue-100 text-blue-900'}`}>
                          {campana.id === 'brecha_mt' ? '🎯 Elegibles MT' : campana.id === 'cross_sell' ? '🔁 Cross-Sell' : '⚠️ Retención'}
                        </span>
                        <span className="text-xs font-mono font-extrabold text-gray-400">
                          ID: {campana.id}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-gray-900 group-hover:text-[#0050B5] transition-colors">
                        {campana.nombre}
                      </h3>

                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {campana.descripcion}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Clientes</span>
                        <span className="text-xl font-extrabold text-blue-950">
                          {campana.total.toLocaleString()}
                        </span>
                      </div>

                      <button className="flex items-center space-x-1 text-xs font-extrabold text-white bg-[#0050B5] group-hover:bg-[#019BDE] px-3.5 py-2 rounded-lg shadow-sm transition-colors">
                        <span>Ver Lista</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Selected Campaign View: List of Clients */}
      {selectedCampaignId && activeCampaignMeta && (
        <div className="space-y-4">
          
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar clientes de la campaña por ID o motivo..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#019BDE] focus:bg-white text-gray-900 placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-gray-500 mr-1 hidden lg:inline flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1 text-gray-400" /> Filtrar:
              </span>

              <button
                onClick={() => setSelectedPriorityFilter('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPriorityFilter === 'todos'
                    ? 'bg-[#0050B5] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas ({campaignPriorityCounts.todos})
              </button>

              <button
                onClick={() => setSelectedPriorityFilter('alta')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  selectedPriorityFilter === 'alta'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>Alta ({campaignPriorityCounts.alta})</span>
              </button>

              <button
                onClick={() => setSelectedPriorityFilter('media')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  selectedPriorityFilter === 'media'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Media ({campaignPriorityCounts.media})</span>
              </button>

              <button
                onClick={() => setSelectedPriorityFilter('baja')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  selectedPriorityFilter === 'baja'
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                <span>Baja ({campaignPriorityCounts.baja})</span>
              </button>

              <div className="ml-auto pl-2 border-l border-gray-200 flex items-center">
                <button
                  onClick={() => setSortBy(sortBy === 'score' ? 'prioridad' : 'score')}
                  className="px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 rounded-lg flex items-center space-x-1 font-medium"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Orden:</span>
                  <span className="font-bold text-blue-700">
                    {sortBy === 'score' ? 'Score Aceptación' : 'Prioridad'}
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* Reused Client Cards List */}
          <div className="space-y-3">
            {filteredCampaignClients.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-xl border border-gray-200 space-y-2">
                <p className="font-bold text-gray-800">No se encontraron clientes para esta campaña con los filtros seleccionados.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedPriorityFilter('todos');
                  }}
                  className="text-xs font-bold text-[#019BDE] hover:underline"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              filteredCampaignClients.map((c) => {
                const isHigh = c.prioridad === 'alta';
                const isMed = c.prioridad === 'media';

                const borderAccentClass = isHigh
                  ? 'border-l-8 border-l-red-600'
                  : isMed
                  ? 'border-l-8 border-l-amber-500'
                  : 'border-l-8 border-l-gray-400';

                const scorePercent = Math.round(c.score_aceptacion * 100);

                const churnColorClass =
                  c.riesgo_churn === 'alto'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : c.riesgo_churn === 'medio'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-green-100 text-green-800 border-green-200';

                return (
                  <Link
                    key={c.cliente_id}
                    href={`/cliente/${c.cliente_id}`}
                    className={`group block bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 ${borderAccentClass} transition-all duration-150 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#019BDE]`}
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {c.cliente_id}
                          </span>

                          <h2 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-[#0050B5] transition-colors">
                            {c.nombre_display}
                          </h2>

                          <PriorityBadge prioridad={c.prioridad} size="sm" />

                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${churnColorClass}`}>
                            Churn: {c.riesgo_churn.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 line-clamp-1">
                          <span className="text-xs text-blue-600 font-bold">Motivo:</span>
                          <span>{c.motivo_prioridad}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                        <div className="flex flex-col items-start sm:items-end min-w-[120px]">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-xs font-bold text-gray-600">Aceptación:</span>
                            <span className="text-sm font-black text-emerald-700">{scorePercent}%</span>
                          </div>

                          <div className="w-28 bg-gray-200 h-2 rounded-full mt-1 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${scorePercent}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 text-sm font-bold text-white bg-[#0050B5] group-hover:bg-[#019BDE] px-3.5 py-2 rounded-lg shadow-sm transition-colors min-w-[120px] justify-center">
                          <span>Atender</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>

                    </div>
                  </Link>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
}
