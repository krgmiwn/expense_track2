
import { GoogleGenAI } from "@google/genai";
import { Transaction, AppState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFinancialAdvice = async (state: AppState): Promise<string> => {
  try {
    const { transactions, profile } = state;
    const recentData = transactions.slice(-10).map(t => `${t.type}: ${t.amount} ${profile.currency} (${t.category})`).join(', ');
    
    const prompt = `
      As a world-class financial advisor, analyze these recent transactions for user ${profile.name}: ${recentData}.
      Provide a concise summary (max 100 words) with 3 actionable tips to improve their spending habits or savings.
      Current currency: ${profile.currency}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.8,
      }
    });

    return response.text || "I couldn't analyze your data right now. Keep tracking your expenses!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Financial advisor is currently offline. Please try again later.";
  }
};
