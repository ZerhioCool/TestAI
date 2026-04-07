import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
// Anclado a Gemini 3 Flash (Abril 2026) para evitar la obsolescencia de las versiones 1.5 y 2.0
const modelName = "gemini-3-flash";

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
