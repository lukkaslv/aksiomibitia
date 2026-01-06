
import React, { useState, useRef, useEffect } from 'react';
import { getAICoachResponse } from '../services/gemini';
import { Message, Axiom, ModelType } from '../types';

// The window.aistudio object is assumed to be provided by the environment.
// We declare it here with an optional modifier to avoid conflicts with global definitions.
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey(): Promise<boolean>;
      openSelectKey(): Promise<void>;
    };
  }
}

interface AICoachProps {
  currentAxiom?: Axiom;
}

const AICoach: React.FC<AICoachProps> = ({ currentAxiom }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Здравствуй. Я здесь, чтобы помочь тебе увидеть то, что уже есть. Выбери аксиому, и мы посмотрим в её суть.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelType, setModelType] = useState<ModelType>('flash');
  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if API key is selected on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setIsKeySelected(selected);
        } catch (err) {
          console.error("Error checking API key selection:", err);
          setIsKeySelected(false);
        }
      } else {
        // Fallback: if aistudio is not present, assume key is provided via env
        setIsKeySelected(true);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (currentAxiom) {
      setInput(`Я созерцаю аксиому "${currentAxiom.title}". Помоги мне интегрировать её в сегодняшний день.`);
    }
  }, [currentAxiom?.id]);

  const handleOpenKeyDialog = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Race condition: assume success after triggering the dialog as per instructions
        setIsKeySelected(true);
        setMessages(prev => [...prev, { role: 'model', text: 'Пространство синхронизировано. Теперь мы можем продолжить путь.' }]);
      }
    } catch (err) {
      console.error("Failed to open key dialog", err);
    }
  };

  const handleSendMessage = async (text: string = input) => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    // Proactively check if key is selected before sending
    if (isKeySelected === false && window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      if (!selected) {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: 'Для общения с ИИ-наставником необходимо выбрать API ключ.',
          customNode: (
            <div className="mt-4">
              <button 
                onClick={handleOpenKeyDialog}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest"
              >
                Выбрать Ключ
              </button>
            </div>
          )
        } as any]);
        return;
      }
    }

    const userMsg: Message = { role: 'user', text: trimmedText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAICoachResponse(trimmedText, messages.filter(m => m.text), modelType);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Тишина...' }]);
    } catch (error: any) {
      const errorMsg = error.message || "";
      console.error("Detailed Error:", errorMsg);

      // If requested entity was not found, reset key selection state and prompt user again
      if (errorMsg.includes("Requested entity was not found")) {
        setIsKeySelected(false);
      }

      let feedback;
      
      if (errorMsg.includes("API_KEY_MISSING") || errorMsg.includes("entity was not found")) {
        feedback = (
          <div className="p-6 bg-blue-50/50 rounded-[28px] border border-blue-100/50 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <p className="font-bold text-blue-800 text-[10px] uppercase tracking-wider">Требуется Активация</p>
            </div>
            <p className="text-xs text-blue-900/70 leading-relaxed font-light">
              Для работы ИИ-наставника необходимо подключить ваш API ключ из платного проекта GCP.
            </p>
            <button 
              onClick={handleOpenKeyDialog}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              Выбрать API Ключ
            </button>
            <p className="text-[9px] text-blue-400 text-center italic">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">Документация по биллингу</a>
            </p>
          </div>
        );
      } else {
        feedback = (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-2">
            <p className="font-bold text-red-700 text-[10px] uppercase tracking-wider">Временная преграда</p>
            <p className="text-[11px] text-red-900 leading-relaxed font-mono bg-white/50 p-2 rounded border border-red-50 break-all">
              {errorMsg || "Связь прервана. Попробуйте еще раз через мгновение."}
            </p>
          </div>
        );
      }

      setMessages(prev => [...prev, { role: 'model', text: '', customNode: feedback } as any]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageText = (msg: Message & { customNode?: React.ReactNode }) => {
    if (msg.customNode) return msg.customNode;
    return msg.text.split('\n').map((paragraph, pIdx) => (
      <p key={pIdx} className="mb-3 last:mb-0">{paragraph}</p>
    ));
  };

  // If key selection is mandatory and hasn't happened yet, show a welcome screen
  if (isKeySelected === false && window.aistudio) {
    return (
      <div className="flex flex-col h-[550px] sm:h-[650px] border border-gray-100 rounded-[40px] bg-white overflow-hidden shadow-2xl items-center justify-center p-10 text-center space-y-8 bg-gradient-to-b from-white to-blue-50/20">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200 animate-bounce">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
        </div>
        <div className="space-y-4 max-w-sm">
          <h2 className="serif text-2xl font-semibold text-gray-900">Активация Наставника</h2>
          <p className="text-sm text-gray-500 font-light leading-relaxed">
            Чтобы начать диалог, необходимо выбрать ваш персональный API ключ. Это обеспечит стабильность и глубину нашего общения.
          </p>
        </div>
        <button 
          onClick={handleOpenKeyDialog}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all active:scale-95"
        >
          Активировать Ключ
        </button>
        <p className="text-[10px] text-gray-400">
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Информация об API и биллинге</a>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[550px] sm:h-[650px] border border-gray-100 rounded-[40px] bg-white overflow-hidden shadow-2xl relative">
      <div className="p-4 border-b border-gray-50 bg-gray-50/40 flex justify-between items-center">
        <div className="flex bg-gray-200/50 p-1 rounded-full">
          <button 
            onClick={() => setModelType('flash')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all duration-300 ${modelType === 'flash' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
          >
            Flash
          </button>
          <button 
            onClick={() => setModelType('pro')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all duration-300 ${modelType === 'pro' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
          >
            Pro <span className="text-[8px] opacity-60 ml-1">Thinking</span>
          </button>
        </div>
        <button 
          onClick={() => setMessages([{ role: 'model', text: 'Пространство очищено.' }])} 
          className="p-2 text-gray-300 hover:text-gray-900 transition-colors"
          title="Сбросить чат"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 no-scrollbar bg-gradient-to-b from-white to-gray-50/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[90%] p-6 rounded-[32px] text-sm lg:text-base leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' 
                : 'bg-white text-gray-800 border border-gray-100'
            }`}>
              {renderMessageText(m as any)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 p-4">
             <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse [animation-delay:0.4s]"></div>
             </div>
             <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Глубокое созерцание...</span>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-50">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="О чем ты хочешь спросить?"
            className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-gray-100 outline-none transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading}
            className="w-14 h-14 flex items-center justify-center bg-gray-900 text-white rounded-2xl hover:bg-black disabled:opacity-20 transition-all shadow-lg active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
        <p className="mt-3 text-[9px] text-gray-300 text-center uppercase tracking-widest font-medium italic">
          Истина всегда внутри вас.
        </p>
      </div>
    </div>
  );
};

export default AICoach;
