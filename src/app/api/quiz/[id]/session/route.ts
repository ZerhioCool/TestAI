import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { multiplayerSessionsTable } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { startedAt, playersCount, leaderboard } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Insert new session
    await db.insert(multiplayerSessionsTable).values({
      quizId: id,
      hostId: user.id,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      endedAt: new Date(),
      playersCount: playersCount || 0,
      leaderboard: leaderboard || {},
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving session:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
