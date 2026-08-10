'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_HISTORIAL } from '@/data/mockData';
import {
  TrendingUp,
  Award,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  History,
  ArrowLeft
} from 'lucide-react';

export default function HistorialPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResult, setFilterResult] = useState<'todos' | 'aceptada' | 'rechazada' | 'mostrada'>('todos');

  const filteredHistory = MOCK_HISTORIAL.filter((item) => {
    if (filterResult !== 'todos' && item.resultado !== filterResult) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        item.cliente_id.toLowerCase().includes(q) ||
        item.nombre_display.toLowerCase().includes(q) ||
        item.oferta.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const renderResultBadge = (resultado: 'aceptada' | 'rechazada' | 'mostrada') => {
    switch (resultado) {
      case 'aceptada':
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aceptada</span>
          </span>
        );
      case 'rechazada':
        return (
          <span className="inline-flex items-center space-x-1 bg-red-100 text-red-900 border border-red-300 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Rechazada</span>
          </span>
        );
      case 'mostrada':
      default:
        return (
          <span className="inline-flex items-center space-x-1 bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <Eye className="w-3.5 h-3.5 text-gray-500" />
            <span>Mostrada</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#002E66] text-white p-4 sm:p-5 rounded-xl shadow-md border border-[#0050B5]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <History className="w-4 h-4 text-[#019BDE]" />
            <span>Historial de Atenciones • Reporte Backtesting</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Trazabilidad de Interacciones Comercial
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
            Registro auditor de atenciones realizadas y métricas de conversión estimadas.
          </p>
        </div>
      </div>

      {/* SECTION 1: 3 Pitch KPIs (Sober Report Format) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-[#0050B5]">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Tasa Aceptación (Últimos 30 días)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-950">
              68.4%
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
              ↑ +4.2% vs mes anterior (Backtest)
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-[#0050B5] rounded-xl border border-blue-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Clientes con Brecha MT Detectados
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              1,420
            </span>
            <span className="text-[11px] font-semibold text-gray-500 block mt-0.5">
              Convergencia móvil + hogar
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              ARPU Incremental Estimado
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-700">
              +S/ 24.50
            </span>
            <span className="text-[11px] font-semibold text-gray-500 block mt-0.5">
              Promedio adicional por cliente
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* SECTION 2: Search & Filter Controls */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID de cliente u oferta..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#019BDE] focus:bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-gray-400" /> Resultado:
          </span>

          <button
            onClick={() => setFilterResult('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterResult === 'todos'
                ? 'bg-[#0050B5] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => setFilterResult('aceptada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterResult === 'aceptada'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            Aceptadas
          </button>

          <button
            onClick={() => setFilterResult('rechazada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterResult === 'rechazada'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            Rechazadas
          </button>

          <button
            onClick={() => setFilterResult('mostrada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterResult === 'mostrada'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Mostradas
          </button>
        </div>
      </div>

      {/* SECTION 3: Responsive History Table / Stacked Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Desktop Table View (≥ md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Oferta Recomendada</th>
                <th className="py-3.5 px-4">Resultado</th>
                <th className="py-3.5 px-4">Canal</th>
                <th className="py-3.5 px-4 text-right">Fecha / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-extrabold text-blue-900">
                    <Link href={`/cliente/${item.cliente_id}`} className="hover:underline flex items-center space-x-1.5">
                      <span>{item.nombre_display}</span>
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    {item.oferta}
                  </td>
                  <td className="py-3.5 px-4">
                    {renderResultBadge(item.resultado)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-600">
                    {item.canal}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-gray-500 text-xs">
                    {item.fecha}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards View (< md) */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredHistory.map((item) => (
            <div key={item.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {item.cliente_id}
                </span>
                {renderResultBadge(item.resultado)}
              </div>

              <h3 className="font-bold text-gray-900 text-sm">{item.oferta}</h3>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Canal: <strong className="text-gray-700">{item.canal}</strong></span>
                <span className="font-mono">{item.fecha}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
