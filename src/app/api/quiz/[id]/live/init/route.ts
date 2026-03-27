import { NextResponse } from "next/server";
import { db } from "@/db";
import { liveSessionsTable, quizzesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Buscar quiz para asegurar que existe y obtener pinCode
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id)).limit(1);
    if (!quiz) return NextResponse.json({ error: "No existe" }, { status: 404 });

    // Crear o recuperar sesión activa
    let [session] = await db.select().from(liveSessionsTable)
      .where(eq(liveSessionsTable.quizId, quiz.id))
      .limit(1);

    if (!session) {
      [session] = await db.insert(liveSessionsTable).values({
        quizId: quiz.id,
        hostId: user?.id,
        status: 'waiting',
      }).returning();
    }

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
