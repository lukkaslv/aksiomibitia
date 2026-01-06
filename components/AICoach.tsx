
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (currentAxiom) {
      setInput(`Я созерцаю аксиому "${currentAxiom.title}". Помоги мне интегрировать её в сегодняшний день.`);
      const inputEl = document.querySelector('input[placeholder="Ваш вопрос..."]') as HTMLInputElement;
      inputEl?.focus();
    }
  }, [currentAxiom?.id]);

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
    } catch (error: any) {
      console.error(error);
      const fallbackModel = currentModel === 'flash' ? 'pro' : 'flash';
      
      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          text: `⚠️ Режим ${currentModel.toUpperCase()} временно недоступен. Попробую переключиться на ${fallbackModel.toUpperCase()}...` 
        }
      ]);

      // Try fallback automatically
      try {
        const response = await getAICoachResponse(trimmedText, messages, fallbackModel);
        setModelType(fallbackModel);
        setMessages(prev => [...prev, { role: 'model', text: response || 'Тишина тоже является ответом.' }]);
      } catch (fallbackError) {
        setMessages(prev => [...prev, { role: 'model', text: 'К сожалению, оба режима сейчас недоступны. Проверьте соединение или API ключ.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageText = (text: string) => {
    const paragraphs = text.split('\n');
    return paragraphs.map((paragraph, pIdx) => {
      if (!paragraph.trim()) return <br key={pIdx} />;
      const isBullet = paragraph.trim().startsWith('* ') || paragraph.trim().startsWith('- ');
      const cleanParagraph = isBullet ? paragraph.trim().substring(2) : paragraph;
      const parts = cleanParagraph.split(/(\*\*.*?\*\*)/g);

      return (
        <div key={pIdx} className={`mb-3 ${isBullet ? 'pl-5 relative' : ''}`}>
          {isBullet && <span className="absolute left-0 top-2 w-2 h-2 bg-current rounded-full opacity-60"></span>}
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-[500px] sm:h-[650px] lg:h-[750px] border border-gray-100 rounded-[24px] lg:rounded-[32px] bg-white overflow-hidden shadow-xl lg:shadow-2xl">
      <div className="p-4 lg:p-7 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${modelType === 'pro' ? 'bg-blue-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${modelType === 'pro' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
            </span>
            Диалог
          </h3>
          
          {/* Model Switcher */}
          <div className="flex bg-gray-200/50 p-1 rounded-full border border-gray-100">
            <button 
              onClick={() => setModelType('flash')}
              className={`px-3 py-1 rounded-full text-[8px] lg:text-[9px] font-bold uppercase tracking-wider transition-all ${modelType === 'flash' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
            >
              Flash
            </button>
            <button 
              onClick={() => setModelType('pro')}
              className={`px-3 py-1 rounded-full text-[8px] lg:text-[9px] font-bold uppercase tracking-wider transition-all ${modelType === 'pro' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
            >
              Pro
            </button>
          </div>
        </div>

        <button 
          onClick={() => setMessages([{ role: 'model', text: 'Мы начинаем с чистого листа.' }])}
          className="text-[9px] lg:text-[10px] text-gray-300 hover:text-gray-500 uppercase tracking-widest font-bold"
        >
          Очистить
        </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-6 lg:space-y-8 scroll-smooth no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
            <div className={`max-w-[90%] sm:max-w-[85%] p-4 lg:p-8 rounded-2xl lg:rounded-3xl text-base lg:text-xl leading-relaxed ${
              m.role === 'user' 
                ? 'bg-gray-900 text-white shadow-lg rounded-tr-none font-medium' 
                : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none'
            }`}>
              {renderMessageText(m.text)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 p-4 lg:p-6 rounded-2xl rounded-tl-none text-sm text-gray-400 font-light italic flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
              {modelType === 'pro' ? 'Глубокое созерцание...' : 'Отклик...'}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 lg:p-8 bg-white border-t border-gray-50">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ваш вопрос..."
            className="w-full bg-gray-50 border-none rounded-xl lg:rounded-2xl pl-4 pr-12 lg:pl-8 lg:pr-20 py-3 lg:py-5 text-base lg:text-xl focus:ring-1 focus:ring-gray-100 outline-none transition-all text-gray-800"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading}
            className={`absolute right-1.5 p-2 lg:p-4 text-white rounded-lg lg:rounded-xl transition-all disabled:opacity-30 ${modelType === 'pro' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-black'}`}
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
