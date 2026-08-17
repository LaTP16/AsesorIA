'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Copy,
  Check,
  X,
  HelpCircle,
  ShieldAlert,
  TrendingUp,
  RefreshCw
} from 'lucide-react';


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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const AdvisorChat: React.FC<AdvisorChatProps> = ({
  cliente_id,
  nombre_display,
  oferta_recomendada,
  oferta_id,
  isDesktopEmbedded = false,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `¡Hola! Soy tu **Copiloto AsesorIA** para **${nombre_display}** (${cliente_id}).\n\nTengo preparado todo el contexto de consumo y propensión para **${oferta_recomendada}**. ¿En qué te ayudo para cerrar la venta?`,
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

  const handleSendMessage = async (textToSend?: string) => {
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

    try {
      const newMessages = [...messages, userMsg];

      const res = await fetch(`${API_BASE_URL}/chat-asesor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente_id,
          oferta_id: oferta_id || 'OF001',
          mensaje_usuario: messageContent,
          historial_mensajes: newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.respuesta || 'No se pudo generar una respuesta en este momento.',
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error en llamada a Copiloto:', err);
      const fallbackMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `💡 **Respuesta de Asesoría IQ**:\n- Destaca que ${nombre_oferta_clean(oferta_recomendada)} incluye beneficios exclusivos para su perfil.\n- Recuérdale al cliente que puede realizar la migración hoy mismo sin costo de activación.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const nombre_oferta_clean = (name: string) => name || 'la oferta seleccionada';

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
    <div className={`flex flex-col bg-white border border-[#E3E2E0] rounded-lg shadow-[0_1px_2px_rgba(15,15,15,0.06)] overflow-hidden ${
      isDesktopEmbedded ? 'h-full min-h-[580px] max-h-[calc(100vh-6rem)]' : 'h-[85vh] max-h-[650px] w-full'
    }`}>
      
      {/* Notion Header */}
      <div className="bg-[#FAF9F6] text-[#37352F] p-3 sm:p-3.5 flex items-center justify-between border-b border-[#E3E2E0] flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="relative p-1.5 bg-[#37352F] text-white rounded-md shadow-sm">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-extrabold text-xs sm:text-sm leading-tight tracking-tight text-[#37352F]">
                Copiloto AsesorIA
              </h3>
              <span className="text-[10px] bg-[#E8F3F7] text-[#017BAE] font-bold px-1.5 py-0.5 rounded border border-[#C8E3ED]">
                IA ACTIVA
              </span>
            </div>
            <p className="text-[10px] text-[#787774] truncate max-w-[200px] sm:max-w-[240px]">
              Contexto: <span className="font-mono text-[#37352F] font-bold">{cliente_id}</span> • {oferta_recomendada}
            </p>
          </div>
        </div>

        {!isDesktopEmbedded && onClose && (
          <button
            onClick={onClose}
            className="p-1 text-[#787774] hover:text-[#37352F] hover:bg-[#F1F0EC] rounded-md transition-colors"
            title="Cerrar Asistente"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 p-3 sm:p-3.5 overflow-y-auto space-y-3 bg-[#F7F6F3]">
        
        {messages.map((m) => {
          const isAssistant = m.role === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} space-y-1`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[85%] rounded-lg p-3 text-xs sm:text-sm leading-relaxed shadow-[0_1px_2px_rgba(15,15,15,0.04)] relative group ${
                  isAssistant
                    ? 'bg-white text-[#37352F] border border-[#E3E2E0]'
                    : 'bg-[#37352F] text-white font-medium'
                }`}
              >
                {/* Assistant Avatar Badge */}
                {isAssistant && (
                  <div className="flex items-center justify-between border-b border-[#E3E2E0] pb-1 mb-1.5 text-[11px] text-[#017BAE] font-bold">
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#017BAE]" />
                      <span>Copiloto Comercial</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(m.content, m.id)}
                      className="text-[#9B9A97] hover:text-[#017BAE] transition-colors p-0.5 rounded"
                      title="Copiar respuesta"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-[#448361]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Formatted Content */}
                <div className="space-y-1">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
                      strong: ({ children }) => (
                        <strong className={isAssistant ? "font-bold text-[#37352F]" : "font-bold text-white"}>
                          {children}
                        </strong>
                      ),
                      ul: ({ children }) => <ul className="space-y-1 my-1 pl-0.5 list-none">{children}</ul>,
                      ol: ({ children }) => <ol className="space-y-1 my-1 pl-4 list-decimal">{children}</ol>,
                      li: ({ children }) => (
                        <li className="flex items-start space-x-1.5 my-0.5">
                          <span className={isAssistant ? "text-[#017BAE] font-bold select-none" : "text-blue-200 font-bold select-none"}>•</span>
                          <span className="flex-1">{children}</span>
                        </li>
                      )
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>


                <span className={`text-[10px] block mt-1 ${isAssistant ? 'text-[#9B9A97] text-right' : 'text-gray-300 text-right'}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Typing Indicator */}
        {loading && (
          <div className="flex items-start space-x-2">
            <div className="bg-white border border-[#E3E2E0] rounded-lg p-2.5 shadow-sm flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#017BAE] animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#37352F] animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#787774] animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-xs font-bold text-[#787774] ml-1">Copiloto analizando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-3 py-1.5 bg-[#FAF9F6] border-t border-[#E3E2E0] flex items-center space-x-1.5 overflow-x-auto flex-shrink-0">
        <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider whitespace-nowrap flex items-center mr-1">
          <Zap className="w-3 h-3 mr-0.5 text-[#D9730D]" /> Tips:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleSendMessage(qp.prompt)}
            className="px-2 py-0.5 bg-white hover:bg-[#F1F0EC] text-[#37352F] border border-[#E3E2E0] rounded-md text-[11px] font-medium whitespace-nowrap transition-colors shadow-none disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-2.5 bg-white border-t border-[#E3E2E0] flex items-center space-x-2 flex-shrink-0">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Consulta al Copiloto sobre ${cliente_id}...`}
          disabled={loading}
          className="flex-1 bg-[#F7F6F3] border border-[#E3E2E0] rounded-md px-3 py-1.5 text-xs sm:text-sm text-[#37352F] focus:outline-none focus:ring-2 focus:ring-[#017BAE]/20 focus:bg-white placeholder-[#9B9A97] font-medium disabled:opacity-50"
        />

        <button
          disabled={!inputMsg.trim() || loading}
          onClick={() => handleSendMessage()}
          className="bg-[#37352F] hover:bg-[#017BAE] text-white p-2 rounded-md shadow-sm transition-colors disabled:opacity-40 flex-shrink-0"
          title="Enviar consulta"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
