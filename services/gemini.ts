
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
  // Ключ берется из process.env.API_KEY
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  // Создаем экземпляр прямо перед вызовом, чтобы всегда иметь актуальный ключ
  const ai = new GoogleGenAI({ apiKey });
  
  const contents = history.map(m => ({ 
    role: m.role === 'user' ? 'user' : 'model', 
    parts: [{ text: m.text }] 
  }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const modelName = modelType === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = { 
    systemInstruction: SYSTEM_INSTRUCTION, 
    temperature: 0.8,
    topP: 0.95,
  };

  // Если выбрана Pro модель, добавляем бюджет на "размышления"
  if (modelType === 'pro') {
    config.thinkingConfig = { thinkingBudget: 16000 };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: config
    });
    
    if (!response.text) {
      throw new Error("EMPTY_RESPONSE");
    }
    
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    // Прокидываем оригинальное сообщение об ошибке для диагностики
    throw new Error(error.message || "UNKNOWN_API_ERROR");
  }
};
