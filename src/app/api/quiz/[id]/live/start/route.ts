import { NextResponse } from "next/server";
import { db } from "@/db";
import { liveSessionsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Cambiar estado a 'playing'
    await db.update(liveSessionsTable)
      .set({ status: 'playing', currentQuestionIndex: 0 })
      .where(eq(liveSessionsTable.quizId, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
