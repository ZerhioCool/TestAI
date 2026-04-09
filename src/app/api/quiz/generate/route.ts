import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `
Eres un experto en pedagogía y creación de cuestionarios. 
Tu tarea es generar preguntas de alta calidad para un quiz interactivo.

REGLAS:
1. Las preguntas pueden ser de tipo "multiple_choice" (4 opciones) o "true_false" (2 opciones).
2. Proporciona distractores plausibles para las preguntas de opción múltiple.
3. El formato de respuesta DEBE ser JSON puro, sin bloques de código Markdown.
4. Si se pide generar un quiz completo, devuelve un objeto con "title" y "questions".
5. Si se pide sugerir preguntas para un quiz existente, devuelve un array de "questions".

Estructura de Pregunta:
{
  "type": "multiple_choice" | "true_false",
  "questionText": "string",
  "options": [ { "id": "A", "text": "..." }, ... ],
  "correctAnswer": ["A"],
  "explanation": "string"
}
`;

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { topic, existingQuestionsCount, suggestedCount = 3, type = "suggestion", language = "es" } = await req.json();

    if (!topic && type === "bulk") {
      return NextResponse.json({ error: "El tema es obligatorio para generación masiva" }, { status: 400 });
    }

    const targetLang = language === 'en' ? 'English' : 'Spanish';
    let prompt = "";
    if (type === "bulk") {
      prompt = `Genera un quiz completo con 5-10 preguntas sobre el tema: "${topic}". 
      TODO EL CONTENIDO debe estar en idioma: ${targetLang}.
      Devuelve un objeto JSON con: { "title": "Título del Quiz", "questions": [...] }`;
    } else {
      prompt = `Sugiere exactamente ${suggestedCount} nuevas preguntas para un quiz sobre el tema: "${topic || 'General'}". 
      TODO EL CONTENIDO debe estar en idioma: ${targetLang}.
      Actualmente el quiz tiene ${existingQuestionsCount || 0} preguntas. No repitas conceptos si es posible.
      Devuelve un array JSON directo de objetos de pregunta.`;
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
    const responseText = result.response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Parse Error:", responseText);
      return NextResponse.json({ error: "Error procesando la respuesta de la IA" }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
