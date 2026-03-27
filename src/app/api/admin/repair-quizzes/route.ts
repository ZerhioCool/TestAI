import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const operations = [
    { name: "user_id", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "user_id" uuid REFERENCES "users"("id")` },
    { name: "title", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "title" text` },
    { name: "source_lang", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "source_lang" text DEFAULT 'es'` },
    { name: "question_count", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "question_count" integer` },
    { name: "time_limit_sec", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "time_limit_sec" integer DEFAULT 30` },
    { name: "is_public", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "is_public" boolean DEFAULT false` },
    { name: "play_count", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "play_count" integer DEFAULT 0` },
    { name: "source_file_url", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "source_file_url" text` },
    { name: "share_token", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "share_token" text` },
    { name: "pin_code", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "pin_code" text` },
    { name: "is_unlocked", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "is_unlocked" boolean DEFAULT false` },
    { name: "max_guest_players", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "max_guest_players" integer DEFAULT 0` },
    { name: "created_at", sql: sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now()` },
  ];

  const results = [];
  for (const op of operations) {
    try {
      await db.execute(op.sql);
      results.push(`${op.name}: OK`);
    } catch (e: any) {
      results.push(`${op.name}: ERROR/EXISTED (${e.message})`);
    }
  }

  return NextResponse.json({ success: true, results });
}
