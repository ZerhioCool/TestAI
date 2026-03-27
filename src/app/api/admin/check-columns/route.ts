import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'quizzes'
    `);
    return NextResponse.json({ columns });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
