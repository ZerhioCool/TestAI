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

    // Buscar el quiz por el PIN numérico
    const activeQuiz = await db.select().from(quizzesTable).where(eq(quizzesTable.pinCode, pin)).limit(1);

    if (activeQuiz.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const quiz = activeQuiz[0];

    // TODO: Validaciones adicionales de límites de jugadores si es necesario

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
