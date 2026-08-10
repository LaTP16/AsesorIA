'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/PriorityBadge';
import { MOCK_CLIENTES_COLA, ClienteQueueItem } from '@/data/mockData';
import {
  Search,
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  Filter,
  Zap,
  ArrowUpDown
} from 'lucide-react';

export default function PriorityQueuePage() {
  const [clientes] = useState<ClienteQueueItem[]>(MOCK_CLIENTES_COLA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'alta' | 'media' | 'baja'>('todos');
  const [sortBy, setSortBy] = useState<'prioridad' | 'score'>('prioridad');

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      
      {/* Top Banner Context */}
      <div className="bg-[#002E66] text-white p-4 sm:p-5 rounded-xl shadow-md border border-[#0050B5]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-[#019BDE]" />
            <span>Motor Priorización IQ • Sintético V1</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Cola de Prioridad Comercial
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
            Ordenados de mayor a menor urgencia. Selecciona un cliente para ver su oferta recomendada y guión de atención.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="bg-red-950/60 border border-red-500/40 rounded-lg px-3 py-2 text-center min-w-[100px]">
            <span className="text-[10px] text-red-200 uppercase font-bold tracking-wider block">Alta Urgencia</span>
            <span className="text-xl font-extrabold text-red-400">{counts.alta}</span>
          </div>
          <div className="bg-amber-950/60 border border-amber-500/40 rounded-lg px-3 py-2 text-center min-w-[100px]">
            <span className="text-[10px] text-amber-200 uppercase font-bold tracking-wider block">Media Urgencia</span>
            <span className="text-xl font-extrabold text-amber-400">{counts.media}</span>
          </div>
          <div className="bg-blue-950/60 border border-blue-400/40 rounded-lg px-3 py-2 text-center min-w-[100px]">
            <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">Total Pendientes</span>
            <span className="text-xl font-extrabold text-white">{counts.todos}</span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Priority Filter Chips */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID (ej. CLI002483), Nombre o Motivo..."
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
            onClick={() => setSelectedFilter('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === 'todos'
                ? 'bg-[#0050B5] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({counts.todos})
          </button>

          <button
            onClick={() => setSelectedFilter('alta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              selectedFilter === 'alta'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>Alta ({counts.alta})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('media')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              selectedFilter === 'media'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Media ({counts.media})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('baja')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              selectedFilter === 'baja'
                ? 'bg-gray-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
            <span>Baja ({counts.baja})</span>
          </button>

          <div className="ml-auto pl-2 border-l border-gray-200 flex items-center">
            <button
              onClick={() => setSortBy(sortBy === 'prioridad' ? 'score' : 'prioridad')}
              className="px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 rounded-lg flex items-center space-x-1 font-medium"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Orden:</span>
              <span className="font-bold text-blue-700">
                {sortBy === 'prioridad' ? 'Prioridad' : 'Aceptación'}
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Client Cards Queue */}
      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-gray-200 space-y-2">
            <AlertOctagon className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="font-bold text-gray-800">No se encontraron clientes con esos filtros.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('todos');
              }}
              className="text-xs font-bold text-[#019BDE] hover:underline"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          filteredClients.map((c) => {
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
  );
}
