'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Zap, Copy, Check, X } from 'lucide-react';
import { getSyntheticChatResponse } from '@/data/mockData';

export interface AdvisorChatProps {
  cliente_id: string;
  nombre_display: string;
  oferta_recomendada: string;
  oferta_id?: string;
  isDesktopEmbedded?: boolean;
  onClose?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({
  cliente_id,
  nombre_display,
  oferta_recomendada,
  isDesktopEmbedded = false,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `¡Hola! Soy tu **Copiloto Movistar IQ** para **${nombre_display}** (${cliente_id}).\n\nTengo preparado todo el contexto de consumo y propensión para **${oferta_recomendada}**. ¿En qué te ayudo para cerrar la venta?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = (textToSend?: string) => {
    const messageContent = textToSend || inputMsg;
    if (!messageContent.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    // Simulate 400ms synthetic AI calculation delay
    setTimeout(() => {
      const responseText = getSyntheticChatResponse(cliente_id, oferta_recomendada, messageContent);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    }, 400);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: '💰 Objeción de precio', prompt: '¿Cómo le respondo si me dice que el precio está muy caro?' },
    { label: '🎯 Beneficios clave', prompt: '¿Cuáles son los 3 beneficios principales que debo destacar?' },
    { label: '⚠️ Riesgo de fuga', prompt: '¿Por qué este cliente fue clasificado con riesgo de fuga?' }
  ];

  return (
    <div className={`flex flex-col bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden ${
      isDesktopEmbedded ? 'h-full min-h-[580px] max-h-[calc(100vh-6rem)]' : 'h-[85vh] max-h-[650px] w-full'
    }`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#002E66] via-[#003B80] to-[#001D42] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-[#0050B5]/40 flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="relative p-2 bg-[#019BDE] text-white rounded-xl shadow-md">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#002E66]"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-extrabold text-sm sm:text-base leading-tight tracking-tight text-white">
                Copiloto Movistar IQ
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
                IA SINTÉTICA
              </span>
            </div>
            <p className="text-[11px] text-blue-200 truncate max-w-[200px] sm:max-w-[240px]">
              Contexto: <span className="font-mono text-white font-bold">{cliente_id}</span> • {oferta_recomendada}
            </p>
          </div>
        </div>

        {!isDesktopEmbedded && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Cerrar Asistente"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-gray-50/50">
        
        {messages.map((m) => {
          const isAssistant = m.role === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} space-y-1`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                  isAssistant
                    ? 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
                    : 'bg-[#0050B5] text-white rounded-tr-none font-medium'
                }`}
              >
                {isAssistant && (
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-1.5 text-[11px] text-blue-900 font-extrabold">
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#019BDE]" />
                      <span>Copiloto Comercial</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(m.content, m.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-0.5 rounded"
                      title="Copiar respuesta"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap space-y-1">
                  {m.content.split('\n').map((line, idx) => {
                    if (line.startsWith('- ')) {
                      return (
                        <div key={idx} className="flex items-start space-x-1.5 pl-1 my-0.5">
                          <span className="text-[#019BDE] font-bold">•</span>
                          <span>{line.replace('- ', '')}</span>
                        </div>
                      );
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>

                <span className={`text-[10px] block mt-1 ${isAssistant ? 'text-gray-400 text-right' : 'text-blue-200 text-right'}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-2">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#019BDE] animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-[#0050B5] animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-blue-900 animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-xs font-bold text-gray-500 ml-1">Copiloto analizando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-3 py-2 bg-gray-100/80 border-t border-gray-200 flex items-center space-x-1.5 overflow-x-auto flex-shrink-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap flex items-center mr-1">
          <Zap className="w-3 h-3 mr-0.5 text-amber-500" /> Tips:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleSendMessage(qp.prompt)}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-950 border border-gray-300 hover:border-blue-300 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors shadow-none disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2 flex-shrink-0">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Consulta al Copiloto sobre ${cliente_id}...`}
          disabled={loading}
          className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#019BDE] focus:bg-white placeholder-gray-400 font-medium disabled:opacity-50"
        />

        <button
          disabled={!inputMsg.trim() || loading}
          onClick={() => handleSendMessage()}
          className="bg-[#0050B5] hover:bg-[#019BDE] text-white p-2.5 rounded-xl shadow-md transition-all disabled:opacity-40 disabled:hover:bg-[#0050B5] flex-shrink-0"
          title="Enviar consulta"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
