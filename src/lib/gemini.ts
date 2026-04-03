import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
// Anclado a una versión antigua específica (-002) porque Google auto-actualiza los alias a 2.0 y el Free Tier falla
const modelName = "gemini-1.5-flash-002";

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
