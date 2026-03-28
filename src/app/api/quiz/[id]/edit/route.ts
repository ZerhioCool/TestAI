import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizzesTable, questionsTable, usersTable } from "@/db/schema";
import { or, eq, and } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { questions } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify ownership
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id)).limit(1);
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    if (quiz.userId && (!user || quiz.userId !== user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Server-side validation of question limits
    let isPro = false;
    if (quiz.userId) {
      const owners = await db.select().from(usersTable).where(eq(usersTable.id, quiz.userId)).limit(1);
      if (owners.length > 0) isPro = owners[0].plan === 'pro';
    }

    const currentLimit = isPro ? 50 : (quiz.isUnlocked ? 10 : 6);
    if (questions.length > currentLimit) {
      return NextResponse.json({ error: `Tu plan permite un máximo de ${currentLimit} preguntas.` }, { status: 403 });
    }

    // Identificar preguntas eliminadas
    const existingQs = await db.select({ id: questionsTable.id }).from(questionsTable).where(eq(questionsTable.quizId, id));
    const newIds = questions.map((q: any) => q.id);
    const toDelete = existingQs.filter(eq => !newIds.includes(eq.id));

    if (toDelete.length > 0) {
      await Promise.all(toDelete.map(async (dq) => {
         await db.delete(questionsTable).where(eq(questionsTable.id, dq.id));
      }));
    }

    // Actualizar o Insertar
    await Promise.all(questions.map(async (q: any, i: number) => {
      if (typeof q.id === 'string' && q.id.startsWith('new-')) {
        await db.insert(questionsTable).values({
          quizId: id,
          orderIndex: i,
          type: q.type || 'multiple_choice',
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points || 100,
        });
      } else {
        await db.update(questionsTable)
          .set({
            orderIndex: i,
            type: q.type || 'multiple_choice',
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })
          .where(and(eq(questionsTable.id, q.id), eq(questionsTable.quizId, id)));
      }
    }));

    // Actualizar el conteo total en el quiz
    await db.update(quizzesTable).set({ questionCount: questions.length }).where(eq(quizzesTable.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
