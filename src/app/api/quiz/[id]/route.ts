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

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const [quiz] = await database
      .select()
      .from(quizzesTable)
      .where(isUuid ? eq(quizzesTable.id, id) : eq(quizzesTable.pinCode, id))
      .limit(1);

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
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
