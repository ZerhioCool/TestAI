import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN "pin_code" text UNIQUE;`);
    return NextResponse.json({ success: true, message: "Column pin_code added successfully" });
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
       return NextResponse.json({ success: true, message: "Column pin_code already existed" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
