import { NextResponse } from "next/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.update(usersTable).set({ plan: 'pro', quizzesThisMonth: 0 });
    return NextResponse.json({ success: true, message: "All users PRO and limits reset" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
