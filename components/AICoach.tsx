
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
  const [needsKey, setNeedsKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setNeedsKey(false);
      setMessages(prev => [...prev, { role: 'model', text: '✅ Ключ подключен. Попробуйте отправить сообщение снова.' }]);
    } catch (e) {
      console.error("Failed to open key dialog", e);
    }
  };

  const handleSendMessage = async (text: string = input, customModel?: ModelType) => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    const currentModel = customModel || modelType;
    const userMsg: Message = { role: 'user', text: trimmedText };
    const newHistory = [...messages, userMsg];
    
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAICoachResponse(trimmedText, messages, currentModel);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Тишина тоже является ответом.' }]);
      setNeedsKey(false);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.message || "";
      
      if (errorMsg.includes("API_KEY") || errorMsg.includes("not found") || errorMsg.includes("403") || errorMsg.includes("401")) {
        setNeedsKey(true);
        setMessages(prev => [
          ...prev, 
          { 
            role: 'model', 
            text: '🔑 Похоже, возникла проблема с API ключом. Пожалуйста, нажмите кнопку ниже, чтобы подключить ваш ключ из Google AI Studio.' 
          }
        ]);
      } else {
        const fallbackModel = currentModel === 'flash' ? 'pro' : 'flash';
        setMessages(prev => [...prev, { role: 'model', text: `⚠️ Ошибка в режиме ${currentModel.toUpperCase()}. Пробую альтернативный путь...` }]);
        
        try {
          const response = await getAICoachResponse(trimmedText, messages, fallbackModel);
          setModelType(fallbackModel);
          setMessages(prev => [...prev, { role: 'model', text: response || 'Ответ получен через резервную модель.' }]);
        } catch (fallbackError) {
          setMessages(prev => [...prev, { role: 'model', text: '❌ Не удалось связаться с ИИ. Проверьте подключение или API ключ.' }]);
          setNeedsKey(true);
        }
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
    <div className="flex flex-col h-[500px] sm:h-[650px] border border-gray-100 rounded-[24px] bg-white overflow-hidden shadow-xl">
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
              {needsKey && m.text.includes('ключом') && (
                <button 
                  onClick={handleOpenKeyDialog}
                  className="mt-4 w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors"
                >
                  Подключить API ключ
                </button>
              )}
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
