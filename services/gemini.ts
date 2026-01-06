
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
  let apiKey: string | undefined;
  
  try {
    // Получаем значение из process.env.API_KEY
    // @ts-ignore
    const envValue = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
    
    // Очищаем от пробелов и кавычек
    apiKey = envValue?.trim().replace(/^["']|["']$/g, '');
    
    // Логируем для отладки в консоль браузера (безопасно)
    if (apiKey) {
      console.log(`[Config] API_KEY check: length=${apiKey.length}, prefix="${apiKey.substring(0, 4)}"`);
    }
  } catch (e) {
    console.warn("Environment access error", e);
  }

  // Сценарий 1: Ключ вообще не задан
  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  // Сценарий 2: Вместо значения вставлено имя переменной (например, "GEMINI_API_KEY")
  const looksLikeVariableName = /^[A-Z_]+$/.test(apiKey) && (apiKey.includes("KEY") || apiKey.includes("GEMI"));
  if (looksLikeVariableName || apiKey.startsWith("$")) {
     throw new Error(`API_KEY_NAME_ERROR|${apiKey}`);
  }

  // Сценарий 3: Ключ есть, но формат неверный
  if (!apiKey.startsWith("AIza")) {
    throw new Error(`API_KEY_INVALID|${apiKey.substring(0, 4)}`);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const contents = history.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const modelName = modelType === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = { 
    systemInstruction: SYSTEM_INSTRUCTION, 
    temperature: 0.75 
  };

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
