import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Asegurarse de usar Node.js runtime nativo para poder usar pdf-parse
export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PEDAGOGICAL_PROMPT = `
Eres un creador experto de cuestionarios pedagógicos. 
Analiza el siguiente texto extraído de un documento y genera un cuestionario interactivo para evaluar los conocimientos del estudiante.

REGLAS ESTRICTAS:
1. Genera un número de preguntas adecuado basado en la extensión del texto (mínimo 5, máximo 15 si el usuario es Pro). Si el texto es corto, mantente en 5.
2. Asegúrate de incluir distractores inteligentes (respuestas incorrectas pero plausibles).
3. Las preguntas pueden ser de tipo opción múltiple ("multiple_choice") con 4 opciones o verdadero/falso ("true_false") con 2 opciones.
4. Tu respuesta DEBE ser un objeto JSON válido, sin delimitadores Markdown (\`\`\`json), que cumpla OBLIGATORIAMENTE la siguiente estructura exacta:

{
  "title": "Un título corto y atractivo para el quiz basado en el contenido",
  "questions": [
    {
      "type": "multiple_choice",
      "questionText": "La pregunta clara y directa",
      "options": [
        { "id": "1", "text": "Opción A" },
        { "id": "2", "text": "Opción B" },
        { "id": "3", "text": "Opción C" },
        { "id": "4", "text": "Opción D" }
      ],
      "correctAnswer": ["1"], // El ID o IDs de las opciones correctas como array de strings
      "explanation": "Una explicación breve de 1-2 oraciones de por qué esta es la respuesta correcta."
    }
  ]
}

TEXTO DEL DOCUMENTO:
---------------------
`;

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { db } = await import('@/db');
    const { usersTable, quizzesTable, questionsTable } = await import('@/db/schema');
    const { eq, sql } = await import('drizzle-orm');
    const { nanoid } = await import('nanoid');

    let dbUserId = null;
    let isFreeUser = true;

    // 1. Verificación de Límite Mensual en DB
    if (user) {
      dbUserId = user.id;
      const existingUser = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
      
      if (existingUser.length > 0) {
        const userPlan = existingUser[0].plan || 'free';
        const usedQuizzes = existingUser[0].quizzesThisMonth || 0;
        
        if (userPlan === 'free' && usedQuizzes >= 1) {
          return NextResponse.json({ error: "Límite mensual alcanzado (1 Quiz Gratis). Pásate a Pro para jugar hasta 40 al mes." }, { status: 403 });
        }
        if (userPlan === 'pro' && usedQuizzes >= 40) {
          return NextResponse.json({ error: "Has alcanzado el límite de 40 quizzes este mes. Contacta con soporte para el plan Corporativo." }, { status: 403 });
        }
        isFreeUser = userPlan === 'free';
      } else {
        // Fallback: Check if there's a ghost record for this email that bypassed deletion
        if (user.email) {
          const ghostUser = await db.select().from(usersTable).where(eq(usersTable.email, user.email)).limit(1);
          if (ghostUser.length > 0) {
            dbUserId = ghostUser[0].id; // Re-adopt the ghost ID
            const userPlan = ghostUser[0].plan || 'free';
            const usedQuizzes = ghostUser[0].quizzesThisMonth || 0;
            
            if (userPlan === 'free' && usedQuizzes >= 1) {
              return NextResponse.json({ error: "Límite mensual alcanzado (1 Quiz Gratis). Pásate a Pro para jugar ilimitado." }, { status: 403 });
            }
            isFreeUser = userPlan === 'free';
          } else {
            await db.insert(usersTable).values({ 
              id: user.id, 
              email: user.email 
            }).onConflictDoNothing();
          }
        } else {
          await db.insert(usersTable).values({ 
            id: user.id, 
            email: "unknown@user.com" 
          }).onConflictDoNothing();
        }
      }
    } else {
      dbUserId = null;
      isFreeUser = true;
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const language = formData.get("language") as string || "es";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron archivos" }, { status: 400 });
    }

    // 2. Verificación Multimodal (Imágenes)
    if (files.length > 2) {
      return NextResponse.json({ error: "Máximo 2 imágenes permitidas en el plan gratis." }, { status: 400 });
    }

    const maxQuestions = isFreeUser ? 5 : 15;
    const targetLang = language === 'en' ? 'English' : 'Spanish';
    const dynamicPrompt = `${PEDAGOGICAL_PROMPT}\n\nREQUERIMIENTO ADICIONAL: Genera hasta ${maxQuestions} preguntas si el contenido lo permite, mezclando selección múltiple y verdadero/falso. TODO EL CONTENIDO (título, preguntas, opciones, explicaciones) debe estar obligatoriamente en idioma: ${targetLang}.`;

    const geminiParts: any[] = [dynamicPrompt];
    let sourceFileName = "Cuestionario.pdf";
    if (files.length > 0 && files[0] && typeof files[0] === 'object' && 'name' in files[0]) {
      sourceFileName = (files[0] as File).name;
    }

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Verificación de Hojas (PDF)
      if (file.type === 'application/pdf') {
        const { PDFDocument } = await import('pdf-lib');
        // Ignorar warnings nativos de PDFDocument
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pageCount = pdfDoc.getPageCount();

        if (isFreeUser && pageCount > 3) {
           return NextResponse.json({ error: `Los PDFs están limitados a 3 hojas en el plan gratuito. Tu PDF tiene ${pageCount}.` }, { status: 403 });
        }
      }

      geminiParts.push({
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type
        }
      });
    }

    // 4. Conectar con gemini-3-flash
    const model = genAI.getGenerativeModel({ 
      model: "	gemini-3.1-flash-lite-preview",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(geminiParts);
    const responseText = result.response.text();

    let quizData;
    try {
      const cleanedText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      quizData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Gemini Parse Error:", parseError, responseText);
      return NextResponse.json({ error: "La IA no pudo procesar el documento." }, { status: 500 });
    }

    // 5. Guardar en Base de Datos
    const pinString = Math.floor(10000 + Math.random() * 90000).toString();
    const shareTokenStr = nanoid(10);

    const [newQuiz] = await db.insert(quizzesTable).values({
      userId: dbUserId,
      title: quizData.title?.substring(0, 255) || "Cuestionario de TestAI",
      sourceLang: language,
      questionCount: quizData.questions?.length || 5,
      shareToken: shareTokenStr,
      pinCode: pinString,
      sourceFileUrl: sourceFileName, 
    }).returning();

    const questionsToInsert = (quizData.questions || []).map((q: any, i: number) => ({
      quizId: newQuiz.id,
      orderIndex: i + 1,
      type: q.type || "multiple_choice",
      questionText: q.questionText || "Pregunta vacía",
      options: q.options || [],
      correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer],
      explanation: q.explanation || "",
    }));

    if (questionsToInsert.length > 0) {
      await db.insert(questionsTable).values(questionsToInsert);
    }

    // 6. Actualizar Cuota del Mes (Paywall Hit)
    if (dbUserId) {
      await db.update(usersTable)
        .set({ quizzesThisMonth: sql`${usersTable.quizzesThisMonth} + 1` })
        .where(eq(usersTable.id, dbUserId));
    }

    return NextResponse.json({ success: true, quizId: newQuiz.id, shareToken: newQuiz.shareToken });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
