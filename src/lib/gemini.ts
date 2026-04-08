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
  // Forzamos el modelo aquí para evitar que cualquier configuración externa lo sobrescriba
  // Priorizamos gemini-3-flash
  return genAI.getGenerativeModel({
    ...config,
    model: "gemini-3-flash",
  });
};

export const DEFAULT_MODEL = modelName;
