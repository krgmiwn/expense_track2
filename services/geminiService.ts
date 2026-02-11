
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AppState, CATEGORIES } from "../types";

// Provide financial advice using Gemini AI based on recent transactions
export const getFinancialAdvice = async (state: AppState): Promise<string> => {
  try {
    const { transactions, profile } = state;
    if (transactions.length === 0) {
      return "Start tracking to unlock neural insights!";
    }

    const recentData = transactions.slice(-15).map(t => `${t.type}: ${t.amount} (${t.category})`).join(', ');
    const prompt = `As a financial coach for ${profile.name}, analyze these transactions: ${recentData}. 
    Current balance: ${state.accounts.reduce((a, b) => a + b.balance, 0)} ${profile.currency}.
    Give 2 bullet points of ultra-concise advice. Max 40 words.`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Keep monitoring your spending patterns.";
  } catch (error) {
    return "AI insights currently recalibrating.";
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
