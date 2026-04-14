import { NextRequest, NextResponse } from "next/server";
import { db as database } from "@/db";
import { quizzesTable, questionsTable, usersTable } from "@/db/schema";
import { or, eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Quiz ID is missing" }, { status: 400 });
    }

    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const [quiz] = await database
      .select()
      .from(quizzesTable)
      .where(isUuid ? eq(quizzesTable.id, id) : eq(quizzesTable.pinCode, id))
      .limit(1);

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // PRIVACY CHECK:
    // Al acceder por PIN permitimos a cualquiera (es la llave).
    // Al acceder por UUID, solo permitimos si es público, si el usuario es el dueño,
    // o si se proporciona el PIN correcto por query param (autorización de invitado).
    if (isUuid) {
        const { searchParams } = new URL(req.url);
        const providedPin = searchParams.get('pin');
        const isOwner = user && quiz.userId === user.id;
        const hasValidPin = providedPin && quiz.pinCode === providedPin;

        if (!quiz.isPublic && !isOwner && !hasValidPin) {
            return NextResponse.json({ error: "Este Test es privado." }, { status: 403 });
        }
    }

    const questions = await database
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.quizId, quiz.id))
      .orderBy(questionsTable.orderIndex);

    let isPro = false;
    if (quiz.userId) {
      const owners = await database.select().from(usersTable).where(eq(usersTable.id, quiz.userId)).limit(1);
      if (owners.length > 0) isPro = owners[0].plan === 'pro';
    }

    return NextResponse.json({ quiz, questions, isPro });
  } catch (error: any) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
