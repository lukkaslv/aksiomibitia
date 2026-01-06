
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
        setHasKey(true); 
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
      } catch (e) {
        console.error("Failed to open key dialog", e);
      }
    }
  };

  const handleSendMessage = async (text: string = input, customModel?: ModelType) => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    if (isAiStudio && !hasKey) {
      handleOpenKeyDialog();
      return;
    }

    const currentModel = customModel || modelType;
    const userMsg: Message = { role: 'user', text: trimmedText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAICoachResponse(trimmedText, messages, currentModel);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Тишина тоже является ответом.' }]);
    } catch (error: any) {
      console.error("API Error Detailed:", error);
      const errorStr = String(error.message || error);
      
      let feedback = (
        <div className="space-y-2">
          <p className="font-bold text-red-500 text-xs">❌ ОШИБКА КОНФИГУРАЦИИ</p>
          <p className="text-xs">Произошла техническая ошибка при обращении к ИИ.</p>
        </div>
      );
      
      if (errorStr.includes("API_KEY_MISSING")) {
        feedback = (
          <div className="space-y-3">
            <p className="font-bold text-amber-600 text-xs">🔑 КЛЮЧ НЕ НАЙДЕН</p>
            <p className="text-xs leading-relaxed">В настройках Vercel отсутствует переменная <b>API_KEY</b>. Добавьте её в <i>Settings -&gt; Environment Variables</i> и сделайте <b>Redeploy</b>.</p>
          </div>
        );
      } else if (errorStr.includes("API_KEY_NAME_ERROR")) {
        const found = errorStr.split('|')[1] || 'GEMINI_API_KEY';
        feedback = (
          <div className="space-y-3">
            <p className="font-bold text-red-600 text-xs">⚠️ ОШИБКА ЗНАЧЕНИЯ</p>
            <p className="text-xs leading-relaxed">Вы вставили текст <b>"{found}"</b> вместо самого ключа. Ключ — это длинный код из букв и цифр, начинающийся на <b>AIza...</b></p>
            <div className="bg-red-50 p-2 rounded text-[10px] text-red-800 border border-red-100">
              <b>Как исправить:</b> Зайдите в Vercel, замените значение переменной <code>API_KEY</code> на настоящий ключ из Google AI Studio и нажмите <b>Redeploy</b>.
            </div>
          </div>
        );
      } else if (errorStr.includes("API_KEY_INVALID")) {
        const start = errorStr.split('|')[1] || '';
        feedback = (
          <div className="space-y-3">
            <p className="font-bold text-red-600 text-xs">⚠️ НЕВЕРНЫЙ ФОРМАТ</p>
            <p className="text-xs leading-relaxed">Ваш ключ начинается на "{start}", но настоящий ключ всегда начинается на <b>AIza</b>. Проверьте, что вы скопировали <i>API Key</i>, а не ID проекта.</p>
          </div>
        );
      } else if (errorStr.includes("403") || errorStr.includes("401")) {
        feedback = (
          <div className="space-y-2">
            <p className="font-bold text-red-600 text-xs">🚫 ОШИБКА ДОСТУПА</p>
            <p className="text-xs">Google отклонил запрос. Проверьте статус ключа (API Key) в Google AI Studio — он должен быть активным.</p>
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

  return (
    <div className="flex flex-col h-[500px] sm:h-[650px] border border-gray-100 rounded-[24px] bg-white overflow-hidden shadow-xl relative">
      {isAiStudio && hasKey === false && (
        <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          <h3 className="serif text-xl font-semibold mb-4">Требуется API Ключ</h3>
          <button 
            onClick={handleOpenKeyDialog}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg"
          >
            Выбрать ключ
          </button>
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
              {renderMessageText(m as any)}
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
