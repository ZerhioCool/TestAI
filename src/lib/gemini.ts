import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
// Downgrade a gemini-1.5-flash ya que los modelos 2.0 tienen limit: 0 (Sin Free Tier disponible en esta cuenta/región)
const modelName = "gemini-1.5-flash";

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
