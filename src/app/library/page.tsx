import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { quizzesTable, usersTable } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { LibraryUI } from "@/components/library/LibraryUI";

export default async function LibraryPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const queryTerm = (searchParams?.q as string) || "";
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch only public quizzes
  const conditions = [eq(quizzesTable.isPublic, true)];
  
  if (queryTerm) {
    const { ilike } = await import("drizzle-orm");
    conditions.push(ilike(quizzesTable.title, `%${queryTerm}%`));
  }

  const publicQuizzes = await db.select({
    quiz: quizzesTable,
    creator: usersTable.fullName,
  })
    .from(quizzesTable)
    .leftJoin(usersTable, eq(quizzesTable.userId, usersTable.id))
    .where(and(...conditions))
    .orderBy(desc(quizzesTable.playCount), desc(quizzesTable.createdAt));

  return <LibraryUI initialQuizzes={publicQuizzes} queryTerm={queryTerm} />;
}
