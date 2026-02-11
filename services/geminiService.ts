
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AppState, CATEGORIES } from "../types";

// Provide financial advice using Gemini AI based on recent transactions
export const getFinancialAdvice = async (state: AppState): Promise<string> => {
  try {
    const { transactions, profile } = state;
    const balance = state.accounts.reduce((a, b) => a + b.balance, 0);
    
    let prompt = "";
    if (transactions.length === 0) {
      prompt = `Introduction: You are a financial assistant for ${profile.name}. Since there are no transactions yet, give a warm 1-sentence welcome and 1 quick tip on how to start budgeting. Max 30 words.`;
    } else {
      const recentData = transactions.slice(-10).map(t => `${t.type}: ${t.amount} (${t.category})`).join(', ');
      prompt = `Greeting & Analysis: You are a financial expert for ${profile.name}. Analyze: ${recentData}. Balance: ${balance} ${profile.currency}. 
      Give a warm greeting and 1 sharp insight. Max 40 words.`;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Neural sync active. Ready for your flow.";
  } catch (error) {
    return "AI insights currently recalibrating.";
  }
};

// Handle free-form financial questions from the user
export const askAI = async (query: string, state: AppState): Promise<string> => {
  try {
    const { transactions, profile } = state;
    const balance = state.accounts.reduce((a, b) => a + b.balance, 0);
    const recentData = transactions.slice(-20).map(t => `${t.type}: ${t.amount} (${t.category})`).join(', ');

    const prompt = `User ${profile.name} asks: "${query}".
    Context: Total Balance is ${balance} ${profile.currency}. Recent history: ${recentData}.
    Provide a professional, concise financial tip or answer. Be extremely helpful but brief. Max 60 words.`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "I couldn't process that query. Try asking something else!";
  } catch (error) {
    console.error("Ask AI Error:", error);
    return "The Oracle is currently offline.";
  }
};

// New AI Feature: Parse natural language into a transaction object
export const parseNeuralCommand = async (input: string): Promise<any> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse this financial entry: "${input}". 
      Available Categories: ${[...CATEGORIES.INCOME, ...CATEGORIES.EXPENSE].join(', ')}.
      Available Accounts: BANK, BKASH, NAGAD, ROCKET, CARD.
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
  } catch (error) {
    console.error("Neural Command Error:", error);
    return null;
  }
};
