
import React, { useState, useRef, useEffect } from 'react';
import { getAICoachResponse } from '../services/gemini';
import { Message, Axiom, ModelType } from '../types';

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
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isAiStudio, setIsAiStudio] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Проверка ключа при загрузке
  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const aiStudio = window.aistudio;
      if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
        setIsAiStudio(true);
        const selected = await aiStudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setIsAiStudio(false);
        // Если мы не в AI Studio, проверяем переменную окружения
        const envKey = process.env.API_KEY;
        // Проверяем, что ключ похож на настоящий (не пустой и длинный)
        setHasKey(!!envKey && envKey.length > 10 && envKey !== 'undefined');
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
    if (isAiStudio) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setHasKey(true);
        setMessages(prev => [...prev, { role: 'model', text: '✅ Ключ подключен! Теперь я могу отвечать.' }]);
      } catch (e) {
        console.error("Failed to open key dialog", e);
      }
    } else {
      // Если на Vercel — просто уведомляем
      alert("На Vercel ключ нужно добавить в настройках проекта (Environment Variables) с именем API_KEY.");
    }
  };

  const handleSendMessage = async (text: string = input, customModel?: ModelType) => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    // Если ключа нет и мы в AI Studio — открываем диалог
    if (!hasKey && isAiStudio) {
      handleOpenKeyDialog();
      return;
    }

    const currentModel = customModel || modelType;
    const userMsg: Message = { role: 'user', text: trimmedText };
    const newHistory = [...messages, userMsg];
    
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAICoachResponse(trimmedText, messages, currentModel);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Тишина тоже является ответом.' }]);
    } catch (error: any) {
      console.error("API Error:", error);
      const errorMsg = error?.message || "";
      
      if (errorMsg.includes("not found") || errorMsg.includes("403") || errorMsg.includes("401") || errorMsg.includes("API_KEY")) {
        setHasKey(false);
        setMessages(prev => [
          ...prev, 
          { 
            role: 'model', 
            text: isAiStudio 
              ? '🔑 Ошибка доступа. Пожалуйста, выберите правильный API ключ.' 
              : '🔑 Ошибка API ключа. Убедитесь, что переменная API_KEY добавлена в настройках Vercel.' 
          }
        ]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: '❌ Техническая ошибка. Попробуйте сменить режим (Flash/Pro) или проверить ключ.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageText = (text: string) => {
    return text.split('\n').map((paragraph, pIdx) => (
      <p key={pIdx} className="mb-3 last:mb-0">{paragraph}</p>
    ));
  };

  return (
    <div className="flex flex-col h-[500px] sm:h-[650px] border border-gray-100 rounded-[24px] bg-white overflow-hidden shadow-xl relative">
      {/* Overlay if no key detected */}
      {(hasKey === false) && (
        <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h3 className="serif text-xl font-semibold mb-2">API Ключ не найден</h3>
          <p className="text-sm text-gray-500 mb-8 max-w-xs">
            {isAiStudio 
              ? "Пожалуйста, подключите ваш API ключ из Google AI Studio, чтобы начать общение."
              : "Вы используете приложение вне AI Studio. Пожалуйста, добавьте переменную API_KEY в настройках вашего хостинга (Vercel)."}
          </p>
          {isAiStudio ? (
            <button 
              onClick={handleOpenKeyDialog}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Подключить ключ
            </button>
          ) : (
            <div className="text-[10px] font-mono bg-gray-100 p-3 rounded-lg text-gray-600 break-all select-all">
              API_KEY: [Ваш_Ключ_Здесь]
            </div>
          )}
        </div>
      )}

      <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-200/50 p-1 rounded-full">
            <button 
              onClick={() => setModelType('flash')}
              className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${modelType === 'flash' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
            >
              Flash
            </button>
            <button 
              onClick={() => setModelType('pro')}
              className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${modelType === 'pro' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
            >
              Pro
            </button>
          </div>
        </div>
        <button onClick={() => setMessages([{ role: 'model', text: 'Начнем заново.' }])} className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">Сброс</button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm lg:text-base ${
              m.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'
            }`}>
              {renderMessageText(m.text)}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-gray-400 italic animate-pulse">Осознание...</div>}
      </div>

      <div className="p-4 border-t border-gray-50">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Задайте вопрос..."
            className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-gray-200 outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading}
            className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
