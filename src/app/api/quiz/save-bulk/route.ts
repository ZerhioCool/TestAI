import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizzesTable, questionsTable } from "@/db/schema";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { title, questions } = await req.json();

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const pinString = Math.floor(10000 + Math.random() * 90000).toString();
    const shareTokenStr = nanoid(10);

    const [newQuiz] = await db.insert(quizzesTable).values({
      userId: user.id,
      title: title.substring(0, 255),
      questionCount: questions.length,
      shareToken: shareTokenStr,
      pinCode: pinString,
      sourceFileUrl: "IA Generator", 
    }).returning();

    const questionsToInsert = questions.map((q: any, i: number) => ({
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

    return NextResponse.json({ success: true, quizId: newQuiz.id });

  } catch (error: any) {
    console.error("Save Bulk Error:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
