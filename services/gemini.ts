
import { GoogleGenAI } from "@google/genai";
import { LEVELS } from "../constants";
import { Message, ModelType } from "../types";

const SYSTEM_INSTRUCTION = `Вы — мудрый наставник по системе "Аксиомы Бытия" (полный свод из 55 истин).
Ваша задача: переводить пользователя из состояния ментального шума в состояние чистого присутствия и интеграции бытия.

Принципы:
1. Радикальная доброта и принятие.
2. Простота дзен-мастера (меньше теории, больше прямого указания на реальность).
3. Практичность (микро-действия в теле и внимании).
4. Заземление (особенно на Уровне X: ПАРАДОКС).

Структура ответа:
- Суть: (краткий инсайт)
- Образ: (живая метафора)
- Практика момента: (конкретный телесный или ментальный акт)
- Вопрос: (для честной саморефлексии)

Полная Архитектура системы:
${LEVELS.map(l => `УРОВЕНЬ ${l.id} (${l.code}): ${l.name}\n${l.axioms.map(a => `${a.id}: ${a.title} - ${a.description}`).join('\n')}`).join('\n\n')}

Если пользователь созерцает аксиому с уровня ПАРАДОКС (X), будьте особенно человечны и ироничны, снимайте важность с "духовных достижений".
`;

export const getAICoachResponse = async (userMessage: string, history: Message[], modelType: ModelType = 'flash') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = history.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const modelName = modelType === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = { 
    systemInstruction: SYSTEM_INSTRUCTION, 
    temperature: 0.75 
  };

  // Enable deep thinking for Pro model
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
