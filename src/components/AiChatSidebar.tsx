"use client";


import { Send, Sparkles, Check, X, Bot, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface AiChatSidebarProps {
  documentContext: string;
  onApplySnippet: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AiChatSidebar({ documentContext, onApplySnippet, isOpen, onClose }: AiChatSidebarProps) {
  const [localInput, setLocalInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: localInput };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setLocalInput("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, documentContext })
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const aiMessageId = `ai-${Date.now()}`;
      setMessages((prev) => [...prev, { id: aiMessageId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { id: aiMessageId, role: 'assistant', content: assistantContent };
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Maaf, terjadi kesalahan saat menghubungi AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="w-full bg-white flex flex-col h-full relative z-40 transition-all">
      {/* Sleek Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-800 tracking-tight">AI Assistant</span>
        </div>
        {/* Close button visible on ALL breakpoints now */}
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
          title="Tutup AI"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center mt-12 px-4 opacity-70">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 shadow-sm">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Butuh bantuan?</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
              Saya bisa membantu menulis draft, memperbaiki struktur, atau merevisi bagian spesifik dari PRD Anda.
            </p>
          </div>
        )}

        {messages.map((m, index) => (
          <div 
            key={m.id} 
            className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{
              animation: 'fadeInUp 0.4s ease-out forwards',
              opacity: 0,
              transform: 'translateY(10px)',
              animationDelay: `${Math.min(index * 0.05, 0.3)}s`
            }}
          >
            <style>{`
              @keyframes fadeInUp {
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div className={`flex flex-col gap-1.5 min-w-0 max-w-[90%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 text-[13px] leading-relaxed shadow-sm ${m.role === 'user'
                ? 'bg-slate-900 text-white rounded-2xl rounded-tr-sm'
                : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm'
                }`}>
                {m.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                ) : (
                  <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-pre:text-slate-700">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Premium Apply Button */}
              {m.role === 'assistant' && m.content.includes('```') && !isLoading && (
                <button
                  onClick={() => {
                    const match = m.content.match(/```(?:markdown)?\n([\s\S]*?)```/);
                    if (match && match[1]) {
                      onApplySnippet(match[1].trim());
                    } else {
                      onApplySnippet(m.content);
                    }
                  }}
                  className="mt-1 group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all text-xs font-semibold text-slate-600 hover:text-indigo-700"
                >
                  <Check className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <span>Terapkan ke Editor</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-slate-800 shadow-sm text-sm flex items-center gap-1.5 max-w-[90%]">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Solid Footer Input */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={handleFormSubmit} className="relative flex items-end bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
          <textarea
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleFormSubmit(e as any);
              }
            }}
            placeholder="Ketik instruksi..."
            rows={1}
            className="w-full pl-4 pr-12 py-3.5 bg-transparent border-0 focus:ring-0 text-[13px] text-slate-700 placeholder:text-slate-400 resize-none max-h-32 min-h-[48px] outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !localInput.trim()}
            className="absolute right-1.5 bottom-1.5 p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
