import { GoogleGenAI } from "@google/genai";

// Helper to safely get API Key from different environments (Vite/Vercel vs Local/Node)
const getApiKey = () => {
  // 1. Try Vite/Vercel environment (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore access errors
  }

  // 2. Try Local/Container environment (process.env)
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore access errors
  }

  return '';
};

const API_KEY = getApiKey();

// Initialize the client
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ mimeType: string, data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const GeminiService = {
  extractPrompt: async (file: File): Promise<string> => {
    if (!API_KEY) throw new Error("API Key is missing");

    try {
      const filePart = await fileToGenerativePart(file);
      
      const prompt = `
        Analyze the uploaded visual content (image or video frame).
        Your task is to generate a highly detailed, professional video generation prompt suitable for high-end AI video models like Sora, Kling, or Runway Gen-3.
        
        Focus on:
        1. Subject details (appearance, action, emotion).
        2. Environment/Background (lighting, texture, atmosphere).
        3. Camera movement (pan, zoom, tracking shots, angles).
        4. Stylistic keywords (e.g., cinematic, photorealistic, 8k, cyberpunk, ethereal).
        
        Output ONLY the prompt text in English, ready to be copied and pasted. Do not include introductory text like "Here is the prompt".
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Flash is efficient for vision tasks
        contents: {
          parts: [
            { inlineData: filePart },
            { text: prompt }
          ]
        }
      });

      return response.text || "Failed to generate prompt.";
    } catch (error) {
      console.error("Gemini Extract Error:", error);
      throw error;
    }
  }
};