import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
// Forzado a gemini-2.5-flash para solucionar el error de cuota en Vercel
const modelName = "gemini-2.5-flash";

console.log(`🚀 Gemini FORCE-LOADED with: ${modelName}`);


if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in environment variables.");
}

export const genAI = new GoogleGenerativeAI(apiKey!);

export const getGeminiModel = (config?: any) => {
  return genAI.getGenerativeModel({
    model: modelName,
    ...config,
  });
};

export const DEFAULT_MODEL = modelName;
