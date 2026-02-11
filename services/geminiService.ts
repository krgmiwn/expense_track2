
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AppState, CATEGORIES } from "../types";

// Helper for exponential backoff retry logic
async function callAIWithRetry(fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    // Retry on 429 (Rate Limit) or 5xx (Server Error)
    const status = error?.status || 0;
    const message = error?.message?.toLowerCase() || "";
    const isRetryable = status === 429 || status >= 500 || message.includes("busy") || message.includes("quota");
    
    if (retries > 0 && isRetryable) {
      console.warn(`AI busy, retrying in ${delay}ms... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callAIWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const getFinancialAdvice = async (state: AppState): Promise<string> => {
  return callAIWithRetry(async () => {
    const { transactions, profile } = state;
    const balance = state.accounts.reduce((a, b) => a + b.balance, 0);
    
    let prompt = "";
    if (transactions.length === 0) {
      prompt = `You are a financial assistant for ${profile.name}. Give a warm 1-sentence welcome and 1 quick tip on how to start budgeting. Max 30 words.`;
    } else {
      const recentData = transactions.slice(-10).map(t => `${t.type}: ${t.amount} (${t.category})`).join(', ');
      prompt = `You are a financial expert for ${profile.name}. Analyze: ${recentData}. Balance: ${balance} ${profile.currency}. 
      Give a warm greeting and 1 sharp, actionable insight. Max 40 words.`;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Neural sync active. Ready for your flow.";
  }).catch(() => "AI insights currently recalibrating. Check back in a moment.");
};

export const askAI = async (query: string, state: AppState): Promise<string> => {
  return callAIWithRetry(async () => {
    const { transactions, profile } = state;
    const balance = state.accounts.reduce((a, b) => a + b.balance, 0);
    const recentData = transactions.slice(-20).map(t => `${t.type}: ${t.amount} (${t.category})`).join(', ');

    const prompt = `User ${profile.name} asks: "${query}".
    Context: Balance: ${balance} ${profile.currency}. Recent: ${recentData}.
    Provide a professional, concise answer. Max 60 words.`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "I couldn't process that query. Try asking something else!";
  }).catch(() => "The Oracle is experiencing high demand. Please try again shortly.");
};

export const parseNeuralCommand = async (input: string): Promise<any> => {
  return callAIWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse: "${input}". 
      Cats: ${[...CATEGORIES.INCOME, ...CATEGORIES.EXPENSE].join(', ')}.
      Accs: BANK, BKASH, NAGAD, ROCKET, CARD.
      Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ['INCOME', 'EXPENSE'] },
            category: { type: Type.STRING },
            accountId: { type: Type.STRING, enum: ['BANK', 'BKASH', 'NAGAD', 'ROCKET', 'CARD'] },
            note: { type: Type.STRING }
          },
          required: ["amount", "type", "category", "accountId"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  }).catch(() => null);
};
