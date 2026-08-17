'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/PriorityBadge';
import {
  Search,
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  Filter,
  Zap,
  ArrowUpDown,
  RefreshCw,
  ServerOff
} from 'lucide-react';

export interface ClienteQueueItem {
  cliente_id: string;
  nombre_display: string;
  prioridad: 'alta' | 'media' | 'baja';
  motivo_prioridad: string;
  score_aceptacion: number;
  riesgo_churn: 'alto' | 'medio' | 'bajo';
}

export interface ColaResumen {
  total_clientes: number;
  alta: number;
  media: number;
  baja: number;
  riesgo_alto_real: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PriorityQueuePage() {
  const [clientes, setClientes] = useState<ClienteQueueItem[]>([]);
  const [resumen, setResumen] = useState<ColaResumen | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'alta' | 'media' | 'baja'>('todos');
  const [sortBy, setSortBy] = useState<'prioridad' | 'score'>('prioridad');

  const fetchCola = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [resCola, resResumen] = await Promise.all([
        fetch(`${API_BASE_URL}/cola-prioridad?limit=100`),
        fetch(`${API_BASE_URL}/cola-prioridad/resumen`)
      ]);
      if (!resCola.ok) {
        throw new Error(`HTTP Error ${resCola.status}: No se pudo cargar la cola de prioridad.`);
      }
      const dataCola = await resCola.json();
      setClientes(dataCola);

      if (resResumen.ok) {
        const dataResumen = await resResumen.json();
        setResumen(dataResumen);
      }
    } catch (err: any) {
      console.error('Error cargando cola de prioridad:', err);
      setErrorMsg('No se pudo conectar con el servidor backend (http://localhost:8000). Asegúrate de que Uvicorn está corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCola();
  }, []);

  const priorityRank: Record<string, number> = {
    alta: 3,
    media: 2,
    baja: 1,
  };

  const filteredClients = useMemo(() => {
    return clientes
      .filter((c) => {
        if (selectedFilter !== 'todos' && c.prioridad !== selectedFilter) {
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
        if (sortBy === 'prioridad') {
          const rankDiff = (priorityRank[b.prioridad] || 0) - (priorityRank[a.prioridad] || 0);
          if (rankDiff !== 0) return rankDiff;
          return b.score_aceptacion - a.score_aceptacion;
        } else {
          return b.score_aceptacion - a.score_aceptacion;
        }
      });
  }, [clientes, searchQuery, selectedFilter, sortBy]);

  const counts = useMemo(() => {
    return {
      todos: clientes.length,
      alta: clientes.filter((c) => c.prioridad === 'alta').length,
      media: clientes.filter((c) => c.prioridad === 'media').length,
      baja: clientes.filter((c) => c.prioridad === 'baja').length,
    };
  }, [clientes]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Top Banner / Notion Callout Style Header */}
      <div className="bg-white text-[#37352F] p-4 sm:p-5 rounded-lg shadow-[0_1px_2px_rgba(15,15,15,0.06)] border border-[#E3E2E0] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-1.5 text-[#017BAE] text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-[#017BAE]" />
            <span>Motor Priorización IQ • API Conectada</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#37352F] tracking-tight">
            Cola de Prioridad Comercial
          </h1>
          <p className="text-xs sm:text-sm text-[#787774] mt-0.5">
            Ordenados de mayor a menor urgencia. Selecciona un cliente para ver su oferta recomendada y guión de atención.
          </p>
        </div>

        {/* Quick Advisor Metrics (Global Totals from /cola-prioridad/resumen) */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="bg-[#FDEBEC] border border-[#F7C1C1] rounded-md px-3 py-2 text-center min-w-[100px]">
            <span className="text-[10px] text-[#EB5757] uppercase font-bold tracking-wider block">Alta Urgencia</span>
            <span className="text-lg font-black text-[#EB5757]">
              {resumen ? resumen.alta.toLocaleString() : counts.alta}
            </span>
          </div>
          <div className="bg-[#FBF3DB] border border-[#F5E0B3] rounded-md px-3 py-2 text-center min-w-[100px]">
            <span className="text-[10px] text-[#D9730D] uppercase font-bold tracking-wider block">Media Urgencia</span>
            <span className="text-lg font-black text-[#D9730D]">
              {resumen ? resumen.media.toLocaleString() : counts.media}
            </span>
          </div>
          <div className="bg-[#F1F1EF] border border-[#E3E2E0] rounded-md px-3 py-2 text-center min-w-[100px]">
            <span className="text-[10px] text-[#787774] uppercase font-bold tracking-wider block">Total Pendientes</span>
            <span className="text-lg font-black text-[#37352F]">
              {resumen ? resumen.total_clientes.toLocaleString() : counts.todos}
            </span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="bg-white p-3 rounded-lg shadow-[0_1px_2px_rgba(15,15,15,0.04)] border border-[#E3E2E0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9A97]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID (ej. CLI002483), Nombre o Motivo..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-[#F7F6F3] border border-[#E3E2E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#017BAE]/20 focus:bg-white text-[#37352F] placeholder-[#9B9A97]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9B9A97] hover:text-[#37352F] font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Priority Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-[#787774] mr-1 hidden lg:inline-flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-[#9B9A97]" /> Filtrar:
          </span>
          
          <button
            onClick={() => setSelectedFilter('todos')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              selectedFilter === 'todos'
                ? 'bg-[#37352F] text-white shadow-sm'
                : 'bg-[#F1F1EF] text-[#787774] hover:bg-[#EFEFEF] border border-[#E3E2E0]'
            }`}
          >
            Todas ({counts.todos})
          </button>

          <button
            onClick={() => setSelectedFilter('alta')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 border ${
              selectedFilter === 'alta'
                ? 'bg-[#EB5757] text-white border-[#EB5757] shadow-sm'
                : 'bg-[#FDEBEC] text-[#EB5757] border-[#F7C1C1] hover:bg-[#FADBDC]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#EB5757]"></span>
            <span>Alta ({counts.alta})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('media')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 border ${
              selectedFilter === 'media'
                ? 'bg-[#D9730D] text-white border-[#D9730D] shadow-sm'
                : 'bg-[#FBF3DB] text-[#D9730D] border-[#F5E0B3] hover:bg-[#F7EBBF]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9730D]"></span>
            <span>Media ({counts.media})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('baja')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 border ${
              selectedFilter === 'baja'
                ? 'bg-[#448361] text-white border-[#448361] shadow-sm'
                : 'bg-[#EDF3EC] text-[#448361] border-[#CBE0D1] hover:bg-[#DDEBDB]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#448361]"></span>
            <span>Baja ({counts.baja})</span>
          </button>

          {/* Sort Selector */}
          <div className="ml-auto pl-2 border-l border-[#E3E2E0] flex items-center">
            <button
              onClick={() => setSortBy(sortBy === 'prioridad' ? 'score' : 'prioridad')}
              className="px-2.5 py-1 text-xs text-[#787774] hover:text-[#37352F] bg-[#F7F6F3] border border-[#E3E2E0] rounded-md flex items-center space-x-1 font-medium"
              title="Cambiar criterio de ordenación"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#017BAE]" />
              <span className="hidden sm:inline">Orden:</span>
              <span className="font-bold text-[#017BAE]">
                {sortBy === 'prioridad' ? 'Prioridad' : 'Aceptación'}
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Pagination & Scope Indicator */}
      <div className="flex items-center justify-between text-xs text-[#787774] font-medium px-1">
        <span>
          Mostrando los <strong className="text-[#37352F] font-bold">{filteredClients.length}</strong> prioritarios de <strong className="text-[#37352F] font-bold">{resumen ? resumen.total_clientes.toLocaleString() : '100,000'}</strong> clientes en cartera
        </span>
        {resumen && (
          <span className="hidden sm:inline text-[#9B9A97]">
            Riesgo Alto Real: <strong className="text-[#EB5757] font-bold">{resumen.riesgo_alto_real}</strong> clientes
          </span>
        )}
      </div>

      {/* Error Banner if API Server Disconnected */}
      {errorMsg && (
        <div className="bg-[#FDEBEC] border border-[#F7C1C1] rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#EB5757] text-xs sm:text-sm font-semibold">
          <div className="flex items-center space-x-2">
            <ServerOff className="w-5 h-5 text-[#EB5757] flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={fetchCola}
            className="flex items-center space-x-1 bg-[#EB5757] hover:bg-[#D84545] text-white px-3 py-1.5 rounded-md font-bold transition-colors text-xs flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white p-8 text-center rounded-lg border border-[#E3E2E0] space-y-3">
          <div className="w-7 h-7 rounded-full border-2 border-[#C8E3ED] border-t-[#017BAE] animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-[#37352F]">Cargando Cola de Prioridad desde API...</p>
        </div>
      ) : (
        /* Client List Queue Container */
        <div className="space-y-2.5">
          {filteredClients.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-lg border border-[#E3E2E0] space-y-2">
              <AlertOctagon className="w-8 h-8 text-[#9B9A97] mx-auto" />
              <p className="font-bold text-[#37352F] text-sm">No se encontraron clientes con esos filtros.</p>
              <p className="text-xs text-[#787774]">Prueba ajustando el texto de búsqueda o selecciones de filtro.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('todos');
                }}
                className="mt-2 text-xs font-bold text-[#017BAE] hover:underline"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            filteredClients.map((c) => {
              const isHigh = c.prioridad === 'alta';
              const isMed = c.prioridad === 'media';

              const borderAccentClass = isHigh
                ? 'border-l-4 border-l-[#EB5757]'
                : isMed
                ? 'border-l-4 border-l-[#D9730D]'
                : 'border-l-4 border-l-[#CBE0D1]';

              const scorePercent = Math.round(c.score_aceptacion * 100);

              const churnColorClass =
                c.riesgo_churn === 'alto'
                  ? 'bg-[#FDEBEC] text-[#EB5757] border-[#F7C1C1]'
                  : c.riesgo_churn === 'medio'
                  ? 'bg-[#FBF3DB] text-[#D9730D] border-[#F5E0B3]'
                  : 'bg-[#EDF3EC] text-[#448361] border-[#CBE0D1]';

              return (
                <Link
                  key={c.cliente_id}
                  href={`/cliente/${c.cliente_id}`}
                  className={`group block bg-white rounded-lg shadow-[0_1px_2px_rgba(15,15,15,0.04)] hover:bg-[#FAF9F6] border border-[#E3E2E0] ${borderAccentClass} transition-all duration-150 overflow-hidden focus:outline-none`}
                >
                  <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left Column: ID, Display Name, Priority Badge, Single-line Reason */}
                    <div className="flex-1 space-y-1.5">
                      
                      {/* Header Row: ID + Display Name + Badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#37352F] bg-[#F1F1EF] px-2 py-0.5 rounded border border-[#E3E2E0]">
                          {c.cliente_id}
                        </span>

                        <h2 className="text-sm sm:text-base font-extrabold text-[#37352F] group-hover:text-[#017BAE] transition-colors">
                          {c.nombre_display}
                        </h2>

                        <PriorityBadge prioridad={c.prioridad} size="sm" />

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${churnColorClass}`}
                        >
                          {c.riesgo_churn === 'alto'
                            ? 'Fuga: ALTA'
                            : c.riesgo_churn === 'medio'
                            ? 'Fuga: MEDIA'
                            : 'Cliente Estable (Sin Fuga)'}
                        </span>
                      </div>

                      {/* 1-line Brief Reason */}
                      <p className="text-xs font-medium text-[#787774] flex items-center gap-1.5 line-clamp-1">
                        <span className="text-xs text-[#017BAE] font-bold">Motivo:</span>
                        <span className="text-[#37352F]">{c.motivo_prioridad}</span>
                      </p>

                    </div>

                    {/* Right Column: Acceptance Score & Tap-to-detail Button */}
                    <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#E3E2E0]">
                      
                      {/* Acceptance Score Progress Indicator */}
                      <div className="flex flex-col items-start sm:items-end min-w-[110px]">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3.5 h-3.5 text-[#448361]" />
                          <span className="text-xs font-bold text-[#787774]">Aceptación:</span>
                          <span className="text-xs font-black text-[#448361]">{scorePercent}%</span>
                        </div>
                        
                        <div className="w-24 bg-[#F1F1EF] h-1.5 rounded-full mt-1 overflow-hidden border border-[#E3E2E0]">
                          <div
                            className="bg-[#448361] h-full rounded-full transition-all duration-300"
                            style={{ width: `${scorePercent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center space-x-1 text-xs font-semibold text-white bg-[#37352F] group-hover:bg-[#017BAE] px-3 py-1.5 rounded-md shadow-sm transition-colors min-w-[100px] justify-center">
                        <span>Atender</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>

                    </div>

                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
