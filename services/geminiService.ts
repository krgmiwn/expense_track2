import { GoogleGenAI } from "@google/genai";
import { Transaction, AppState } from "../types";

export const getFinancialAdvice = async (state: AppState): Promise<string> => {
  // Check if API key exists to avoid crashing the app during initialization
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing. Please set it in your Vercel Environment Variables.");
    return "Please set your Gemini API Key in the settings to get personalized financial advice.";
  }

  try {
    const { transactions, profile } = state;
    const recentData = transactions.slice(-10).map(t => `${t.type}: ${t.amount} ${profile.currency} (${t.category})`).join(', ');
    
    const prompt = `
      As a world-class financial advisor, analyze these recent transactions for user ${profile.name}: ${recentData}.
      Provide a concise summary (max 100 words) with 3 actionable tips to improve their spending habits or savings.
      Current currency: ${profile.currency}.
    `;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    return "Financial advisor is currently offline. Check your API key or try again later.";
  }
};