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
          <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aceptada</span>
          </span>
        );
      case 'rechazada':
        return (
          <span className="inline-flex items-center space-x-1 bg-red-100 text-red-800 border border-red-300 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Rechazada</span>
          </span>
        );
      case 'mostrada':
        return (
          <span className="inline-flex items-center space-x-1 bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm">
            <Eye className="w-3.5 h-3.5 text-gray-500" />
            <span>Mostrada</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center space-x-2">
            <History className="w-6 h-6 text-[#0050B5]" />
            <span>Historial e Impacto Comercial</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Métricas de backtesting comercial y registro detallado de interacciones de asesores.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0050B5] hover:text-[#019BDE] bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Cola</span>
        </Link>
      </div>

      {/* Section 1: Top 3 KPI Panel in Sober Report Format (Requirement #1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Tasa de aceptación (últimos 30 días)
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight">
              68.4%
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              +12.3% vs previo
            </span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            Basado en 2,480 interacciones comerciales evaluadas en backtesting.
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Clientes con brecha Movistar Total detectados
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight">
              1,420
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Alta propensión
            </span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            Identificados automáticamente por el modelo predictivo Movistar IQ.
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            ARPU incremental estimado
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
              +S/ 24.50
            </span>
            <span className="text-xs font-semibold text-gray-500">/ cliente / mes</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            Incremento estimado de facturación neta recurrente tras la conversión.
          </p>
        </div>

      </div>

      {/* Controls Bar: Search & Result Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, oferta (ej. Movistar Total Plus) o canal..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#019BDE] focus:bg-white text-gray-900"
          />
        </div>

        {/* Result Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-gray-500 mr-1 hidden lg:inline">Resultado:</span>

          <button
            onClick={() => setFilterResult('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterResult === 'todos'
                ? 'bg-[#0050B5] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({historyList.length})
          </button>

          <button
            onClick={() => setFilterResult('aceptada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              filterResult === 'aceptada'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>Aceptada</span>
          </button>

          <button
            onClick={() => setFilterResult('rechazada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              filterResult === 'rechazada'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
            }`}
          >
            <span>Rechazada</span>
          </button>

          <button
            onClick={() => setFilterResult('mostrada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              filterResult === 'mostrada'
                ? 'bg-gray-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Mostrada</span>
          </button>
        </div>

      </div>

      {/* Section 2 & 3: History Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* DESKTOP TABLE VIEW (Requirement #2) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[11px] font-extrabold tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">Cliente</th>
                <th scope="col" className="px-6 py-3.5">Oferta</th>
                <th scope="col" className="px-6 py-3.5">Resultado</th>
                <th scope="col" className="px-6 py-3.5">Canal</th>
                <th scope="col" className="px-6 py-3.5 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron registros en el historial.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                    
                    {/* Cliente Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.cliente_id}
                        </span>
                        <span className="font-bold text-gray-900">{item.nombre_display}</span>
                      </div>
                    </td>

                    {/* Oferta Column */}
                    <td className="px-6 py-4 whitespace-nowrap font-extrabold text-blue-950">
                      {item.oferta_presentada}
                    </td>

                    {/* Resultado Column (Requirement #2: Badge Verde / Rojo / Gris) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderResultadoBadge(item.resultado)}
                    </td>

                    {/* Canal Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-xs font-semibold">
                      {item.canal}
                    </td>

                    {/* Fecha Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-500 font-semibold">
                      {item.fecha}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE STACKED CARDS VIEW (Requirement #3: Collapse to stacked cards in mobile) */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredHistory.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm font-semibold">
              No hay registros en el historial.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.cliente_id}
                    </span>
                    <span className="font-bold text-gray-900 text-sm">{item.nombre_display}</span>
                  </div>

                  {renderResultadoBadge(item.resultado)}
                </div>

                <div className="text-sm font-extrabold text-blue-950">
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
