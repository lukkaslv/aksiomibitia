
import { GoogleGenAI } from "@google/genai";
import { LEVELS } from "../constants";
import { Message, ModelType } from "../types";

const SYSTEM_INSTRUCTION = `Вы — мудрый наставник по системе "Аксиомы Бытия".
Ваша задача: переводить пользователя из состояния ментального шума в состояние чистого присутствия.

Принципы:
1. Радикальная доброта.
2. Простота дзен-мастера.
3. Практичность.
4. Заземление.

Структура ответа:
- Суть: (инсайт)
- Образ: (метафора)
- Практика: (действие)
- Вопрос: (рефлексия)

Архитектура:
${LEVELS.map(l => `УРОВЕНЬ ${l.id}: ${l.name}\n${l.axioms.map(a => `${a.id}: ${a.title}`).join('\n')}`).join('\n\n')}
`;

export const getAICoachResponse = async (userMessage: string, history: Message[], modelType: ModelType = 'flash') => {
  // Важно: создаем новый экземпляр при каждом запросе, чтобы использовать актуальный API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents = history.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  // Используем Gemini 3 для лучшей производительности и совместимости
  const modelName = modelType === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = { 
    systemInstruction: SYSTEM_INSTRUCTION, 
    temperature: 0.75 
  };

  // Thinking доступен только для Pro версии
  if (modelType === 'pro') {
    config.thinkingConfig = { thinkingBudget: 16000 };
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: contents,
    config: config
  });
  
  return response.text;
};
