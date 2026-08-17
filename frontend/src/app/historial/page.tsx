'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_HISTORIAL_REAL, HistorialItem } from '@/data/mockClients';
import {
  History,
  TrendingUp,
  Target,
  DollarSign,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';

export default function HistorialPage() {
  const [historyList, setHistoryList] = useState<HistorialItem[]>(MOCK_HISTORIAL_REAL);
  const [filterResult, setFilterResult] = useState<'todos' | 'aceptada' | 'rechazada' | 'mostrada'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = historyList.filter((item) => {
    if (filterResult !== 'todos' && item.resultado !== filterResult) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        item.cliente_id.toLowerCase().includes(q) ||
        item.nombre_display.toLowerCase().includes(q) ||
        item.oferta_presentada.toLowerCase().includes(q) ||
        item.canal.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Render Badge helper according to user spec
  // Badge Verde "Aceptada" / Rojo "Rechazada" / Gris "Mostrada"
  const renderResultadoBadge = (resultado: 'aceptada' | 'rechazada' | 'mostrada') => {
    switch (resultado) {
      case 'aceptada':
        return (
          <span className="inline-flex items-center space-x-1 bg-[#EDF3EC] text-[#448361] border border-[#CBE0D1] px-2 py-0.5 rounded-md text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#448361]" />
            <span>Aceptada</span>
          </span>
        );
      case 'rechazada':
        return (
          <span className="inline-flex items-center space-x-1 bg-[#FDEBEC] text-[#EB5757] border border-[#F7C1C1] px-2 py-0.5 rounded-md text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5 text-[#EB5757]" />
            <span>Rechazada</span>
          </span>
        );
      case 'mostrada':
        return (
          <span className="inline-flex items-center space-x-1 bg-[#F1F1EF] text-[#787774] border border-[#E3E2E0] px-2 py-0.5 rounded-md text-xs font-semibold">
            <Eye className="w-3.5 h-3.5 text-[#787774]" />
            <span>Mostrada</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#37352F] tracking-tight flex items-center space-x-2">
            <History className="w-5 h-5 text-[#017BAE]" />
            <span>Historial e Impacto Comercial</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#787774] mt-0.5">
            Métricas de backtesting comercial y registro detallado de interacciones de asesores.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#37352F] hover:text-[#017BAE] bg-white hover:bg-[#F1F0EC] px-3 py-1.5 rounded-md border border-[#E3E2E0] shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Cola</span>
        </Link>
      </div>

      {/* Section 1: Top 3 KPI Panel in Sober Report Format */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* KPI 1 */}
        <div className="bg-white p-4.5 rounded-lg border border-[#E3E2E0] shadow-[0_1px_2px_rgba(15,15,15,0.04)] space-y-1">
          <span className="text-xs font-semibold text-[#787774] uppercase tracking-wider block">
            Tasa de aceptación (últimos 30 días)
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-[#37352F] tracking-tight">
              68.4%
            </span>
            <span className="text-xs font-bold text-[#448361] bg-[#EDF3EC] px-2 py-0.5 rounded border border-[#CBE0D1]">
              +12.3% vs previo
            </span>
          </div>
          <p className="text-[11px] text-[#9B9A97] font-medium">
            Basado en 2,480 interacciones comerciales evaluadas en backtesting.
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4.5 rounded-lg border border-[#E3E2E0] shadow-[0_1px_2px_rgba(15,15,15,0.04)] space-y-1">
          <span className="text-xs font-semibold text-[#787774] uppercase tracking-wider block">
            Clientes con brecha Movistar Total detectados
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-[#37352F] tracking-tight">
              1,420
            </span>
            <span className="text-xs font-bold text-[#017BAE] bg-[#E8F3F7] px-2 py-0.5 rounded border border-[#C8E3ED]">
              Alta propensión
            </span>
          </div>
          <p className="text-[11px] text-[#9B9A97] font-medium">
            Identificados automáticamente por el modelo predictivo AsesorIA.
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4.5 rounded-lg border border-[#E3E2E0] shadow-[0_1px_2px_rgba(15,15,15,0.04)] space-y-1">
          <span className="text-xs font-semibold text-[#787774] uppercase tracking-wider block">
            ARPU incremental estimado
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-[#448361] tracking-tight">
              +S/ 24.50
            </span>
            <span className="text-xs font-semibold text-[#787774]">/ cliente / mes</span>
          </div>
          <p className="text-[11px] text-[#9B9A97] font-medium">
            Incremento estimado de facturación neta recurrente tras la conversión.
          </p>
        </div>

      </div>

      {/* Controls Bar: Search & Result Filters */}
      <div className="bg-white p-3 rounded-lg shadow-[0_1px_2px_rgba(15,15,15,0.04)] border border-[#E3E2E0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9A97]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, oferta (ej. Movistar Total Plus) o canal..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-[#F7F6F3] border border-[#E3E2E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#017BAE]/20 focus:bg-white text-[#37352F] placeholder-[#9B9A97]"
          />
        </div>

        {/* Result Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-[#787774] mr-1 hidden lg:inline">Resultado:</span>

          <button
            onClick={() => setFilterResult('todos')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              filterResult === 'todos'
                ? 'bg-[#37352F] text-white shadow-sm'
                : 'bg-[#F1F1EF] text-[#787774] hover:bg-[#EFEFEF] border border-[#E3E2E0]'
            }`}
          >
            Todos ({historyList.length})
          </button>

          <button
            onClick={() => setFilterResult('aceptada')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 border ${
              filterResult === 'aceptada'
                ? 'bg-[#448361] text-white border-[#448361] shadow-sm'
                : 'bg-[#EDF3EC] text-[#448361] border-[#CBE0D1] hover:bg-[#DDEBDB]'
            }`}
          >
            <span>Aceptada</span>
          </button>

          <button
            onClick={() => setFilterResult('rechazada')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 border ${
              filterResult === 'rechazada'
                ? 'bg-[#EB5757] text-white border-[#EB5757] shadow-sm'
                : 'bg-[#FDEBEC] text-[#EB5757] border-[#F7C1C1] hover:bg-[#FADBDC]'
            }`}
          >
            <span>Rechazada</span>
          </button>

          <button
            onClick={() => setFilterResult('mostrada')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              filterResult === 'mostrada'
                ? 'bg-[#37352F] text-white shadow-sm'
                : 'bg-[#F1F1EF] text-[#787774] hover:bg-[#EFEFEF] border border-[#E3E2E0]'
            }`}
          >
            <span>Mostrada</span>
          </button>
        </div>

      </div>

      {/* Section 2 & 3: History Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(15,15,15,0.04)] border border-[#E3E2E0] overflow-hidden">
        
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF9F6] border-b border-[#E3E2E0] text-[#787774] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3">Cliente</th>
                <th scope="col" className="px-5 py-3">Oferta</th>
                <th scope="col" className="px-5 py-3">Resultado</th>
                <th scope="col" className="px-5 py-3">Canal</th>
                <th scope="col" className="px-5 py-3 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E2E0] text-[#37352F] font-medium">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#9B9A97]">
                    No se encontraron registros en el historial.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF9F6] transition-colors">
                    
                    {/* Cliente Column */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#37352F] bg-[#F1F1EF] px-2 py-0.5 rounded border border-[#E3E2E0]">
                          {item.cliente_id}
                        </span>
                        <span className="font-extrabold text-[#37352F]">{item.nombre_display}</span>
                      </div>
                    </td>

                    {/* Oferta Column */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-extrabold text-[#37352F]">
                      {item.oferta_presentada}
                    </td>

                    {/* Resultado Column */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {renderResultadoBadge(item.resultado)}
                    </td>

                    {/* Canal Column */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-[#787774] text-xs font-semibold">
                      {item.canal}
                    </td>

                    {/* Fecha Column */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs text-[#9B9A97] font-semibold">
                      {item.fecha}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE STACKED CARDS VIEW */}
        <div className="md:hidden divide-y divide-[#E3E2E0]">
          {filteredHistory.length === 0 ? (
            <div className="p-6 text-center text-[#9B9A97] text-xs font-semibold">
              No hay registros en el historial.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#37352F] bg-[#F1F1EF] px-2 py-0.5 rounded border border-[#E3E2E0]">
                      {item.cliente_id}
                    </span>
                    <span className="font-bold text-[#37352F] text-xs sm:text-sm">{item.nombre_display}</span>
                  </div>

                  {renderResultadoBadge(item.resultado)}
                </div>

                <div className="text-xs font-extrabold text-[#37352F]">
                  {item.oferta_presentada}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 font-semibold pt-1 border-t border-gray-100">
                  <span>Canal: <strong className="text-gray-800">{item.canal}</strong></span>
                  <span>{item.fecha}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
