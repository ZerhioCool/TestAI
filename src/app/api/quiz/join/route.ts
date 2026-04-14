import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and, gte, count } from "drizzle-orm";
import { quizzesTable, securityLogsTable } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { pin, name, language } = await req.json();

    if (!pin || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Rate-Limiting Securiry Check
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const failedAttempts = await db
      .select({ val: count() })
      .from(securityLogsTable)
      .where(
        and(
          eq(securityLogsTable.ipAddress, ip),
          eq(securityLogsTable.action, "pin_auth"),
          eq(securityLogsTable.isSuccess, false),
          gte(securityLogsTable.createdAt, fifteenMinutesAgo)
        )
      );

    if (failedAttempts[0].val >= 5) {
      return NextResponse.json({ error: "Demasiados intentos fallidos. Inténtalo de nuevo más tarde." }, { status: 429 });
    }

    // Buscar el test por el PIN numérico
    const activeQuiz = await db.select().from(quizzesTable).where(eq(quizzesTable.pinCode, pin)).limit(1);

    if (activeQuiz.length === 0) {
      // Registrar Intento Fallido
      await db.insert(securityLogsTable).values({
        ipAddress: ip,
        action: "pin_auth",
        targetId: pin,
        isSuccess: false
      });
      return NextResponse.json({ error: "Test no encontrado" }, { status: 404 });
    }

    const quiz = activeQuiz[0];

    // Registrar Intento Exitoso
    await db.insert(securityLogsTable).values({
      ipAddress: ip,
      action: "pin_auth",
      targetId: pin,
      isSuccess: true
    });

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
      quizTitle: quiz.title,
      pin: quiz.pinCode
    });

  } catch (error: any) {
    console.error("Join API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
