import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizzesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { pin, name, language } = await req.json();

    if (!pin || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Buscar el test por el PIN numérico
    const activeQuiz = await db.select().from(quizzesTable).where(eq(quizzesTable.pinCode, pin)).limit(1);

    if (activeQuiz.length === 0) {
      return NextResponse.json({ error: "Test no encontrado" }, { status: 404 });
    }

    const quiz = activeQuiz[0];

    // 1. Verificar Expiración
    if (quiz.expiresAt && new Date() > quiz.expiresAt) {
      return NextResponse.json({ error: "Este Test ha caducado" }, { status: 403 });
    }

    // 2. Verificar si es un Pase ya usado
    if (quiz.usedAt) {
      return NextResponse.json({ error: "Este Test ya fue jugado y no admite más participantes" }, { status: 403 });
    }

    // 3. Verificar límite de jugadores (si aplica)
    if (quiz.maxGuestPlayers && quiz.maxGuestPlayers > 0) {
      const { multiplayerSessionsTable } = await import('@/db/schema');
      const session = await db.select().from(multiplayerSessionsTable).where(eq(multiplayerSessionsTable.quizId, quiz.id)).limit(1);
      
      if (session.length > 0 && session[0].playersCount >= quiz.maxGuestPlayers) {
        return NextResponse.json({ error: `Sala llena. Límite de ${quiz.maxGuestPlayers} jugadores alcanzado.` }, { status: 403 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      quizId: quiz.id, 
      quizTitle: quiz.title 
    });

  } catch (error: any) {
    console.error("Join API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
