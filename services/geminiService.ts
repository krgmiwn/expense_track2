
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AppState, CATEGORIES } from "../types";

// Enhanced retry logic with jitter to avoid synchronized retries
async function callAIWithRetry(fn: () => Promise<any>, retries = 4, delay = 1500): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status || 0;
    const message = error?.message?.toLowerCase() || "";
    // 429 = Rate limit, 503 = Service Unavailable
    const isRetryable = status === 429 || status === 503 || status >= 500 || message.includes("busy") || message.includes("quota") || message.includes("demand");
    
    if (retries > 0 && isRetryable) {
      const jitter = Math.random() * 500;
      console.warn(`Neural Link Busy (${status}). Re-establishing in ${Math.round(delay + jitter)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
      return callAIWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const checkNeuralStatus = async (): Promise<'stable' | 'busy'> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Use a tiny prompt to check connectivity and responsiveness
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'ping',
      config: { maxOutputTokens: 1 }
    });
    return response.text ? 'stable' : 'busy';
  } catch (error: any) {
    return 'busy';
  }
};

export const getFinancialAdvice = async (state: AppState): Promise<string> => {
  return callAIWithRetry(async () => {
    const { transactions, profile, accounts } = state;
    const balance = accounts.reduce((a, b) => a + b.balance, 0);
    const aiNickname = profile.chatbotNickname || "Oracle";
    
    const recentData = transactions.slice(-10).map(t => `${t.type}: ${t.amount} (${t.category})`).join(', ');
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a quick insight for ${profile.name}. Balance: ${balance} ${profile.currency}. Context: ${recentData || 'No history yet.'}`,
      config: {
        systemInstruction: `You are ${aiNickname}, a world-class financial neural engine. Be extremely concise (max 35 words). Give one sharp, helpful insight based on current status. If no history, give a warm welcome.`,
        temperature: 0.8,
        topP: 0.95,
      }
    });

    return response.text?.trim() || "Neural link stable. Awaiting data.";
  }).catch((err) => {
    console.error(err);
    return "Neural bandwidth limited. Operating in local buffer mode.";
  });
};

export const askAI = async (query: string, state: AppState): Promise<string> => {
  return callAIWithRetry(async () => {
    const { transactions, profile, accounts } = state;
    const balance = accounts.reduce((a, b) => a + b.balance, 0);
    const aiNickname = profile.chatbotNickname || "Oracle";
    const recentData = transactions.slice(-20).map(t => `${t.type}: ${t.amount} (${t.category})`).join(', ');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Query: "${query}"`,
      config: {
        systemInstruction: `You are ${aiNickname}. Financial state of ${profile.name}: Balance ${balance} ${profile.currency}, Recent flow: ${recentData}. Answer user queries with professional, data-driven precision. Max 60 words.`,
        temperature: 0.7,
      }
    });

    return response.text?.trim() || "Query processed but buffer empty. Rephrase?";
  }).catch(() => "Oracle is deep-calculating global trends. Please try again in 30 seconds.");
};

export const parseNeuralCommand = async (input: string): Promise<any> => {
  return callAIWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Direct Entry: "${input}"`,
      config: {
        systemInstruction: `Parse the user's financial entry. Categories: ${[...CATEGORIES.INCOME, ...CATEGORIES.EXPENSE].join(', ')}. Accounts: BANK, BKASH, NAGAD, ROCKET, CARD. Output strictly JSON.`,
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
