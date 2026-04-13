import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizzesTable, questionsTable, usersTable } from "@/db/schema";
import { nanoid } from "nanoid";
import { getPlanConfig } from "@/lib/plans";
import { eq, sql } from "drizzle-orm";

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

    // 1. Verificación de Límite Mensual
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
    const userPlan = existingUser[0]?.plan || 'free';
    const usedQuizzes = existingUser[0]?.quizzesThisMonth || 0;
    const config = getPlanConfig(userPlan);
    const isFreeUser = userPlan === 'free';

    if (userPlan === 'free' && usedQuizzes >= config.maxQuizzesPerMonth) {
      return NextResponse.json({ error: `Límite mensual alcanzado (${config.maxQuizzesPerMonth} Test Gratis).` }, { status: 403 });
    }

    const pinString = Math.floor(10000 + Math.random() * 90000).toString();
    const shareTokenStr = nanoid(10);
    const expiresAt = isFreeUser ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

    const [newQuiz] = await db.insert(quizzesTable).values({
      userId: user.id,
      title: title.substring(0, 255),
      questionCount: questions.length,
      shareToken: shareTokenStr,
      pinCode: pinString,
      sourceFileUrl: "IA Generator", 
      expiresAt: expiresAt,
      maxGuestPlayers: config.maxPlayers
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

    // 3. Actualizar cuota
    await db.update(usersTable)
      .set({ quizzesThisMonth: sql`${usersTable.quizzesThisMonth} + 1` })
      .where(eq(usersTable.id, user.id));

    return NextResponse.json({ success: true, quizId: newQuiz.id });

  } catch (error: any) {
    console.error("Save Bulk Error:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
