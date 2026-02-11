
import { GoogleGenAI } from "@google/genai";
import { Transaction, AppState } from "../types";

// Provide financial advice using Gemini AI based on recent transactions
export const getFinancialAdvice = async (state: AppState): Promise<string> => {
  try {
    const { transactions, profile } = state;
    
    // If no transactions yet, provide a friendly placeholder
    if (transactions.length === 0) {
      return "Start adding transactions to get personalized financial advice from your AI advisor!";
    }

    const recentData = transactions.slice(-10).map(t => `${t.type}: ${t.amount} ${profile.currency} (${t.category})`).join(', ');
    
    const prompt = `
      As a world-class financial advisor, analyze these recent transactions for user ${profile.name}: ${recentData}.
      Provide a concise summary (max 100 words) with 3 actionable tips to improve their spending habits or savings.
      Current currency: ${profile.currency}.
    `;

    // Always create a new GoogleGenAI instance right before making an API call
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
    // Graceful error response without exposing technical details or asking for API keys
    return "Financial advisor is currently offline. Please try again later.";
  }
};
