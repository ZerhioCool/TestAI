import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { quizzesTable, usersTable, multiplayerSessionsTable } from "@/db/schema";
import { eq, desc, and, or, ilike, gt, isNull } from "drizzle-orm";
import { DashboardUI } from "@/components/dashboard/DashboardUI";

export default async function DashboardPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error as string;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const userInfo = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
  const isPro = userInfo.length > 0 && userInfo[0].plan === 'pro';

  const queryTerm = (searchParams?.q as string) || "";
  const filterType = (searchParams?.filter as string) || "all";

  // Construir condiciones de Drizzle
  const quizConditions: any[] = [];
  
  // 1. Manejo del tipo de filtro
  if (filterType === "mine") {
    quizConditions.push(eq(quizzesTable.userId, user.id));
  } else if (filterType === "public") {
    quizConditions.push(eq(quizzesTable.isPublic, true));
  } else {
    // 'all' = Míos o públicos
    quizConditions.push(or(eq(quizzesTable.userId, user.id), eq(quizzesTable.isPublic, true)));
  }

  // 3. Filtrar expirados (Solo mostrar los que no han expirado o no tienen expiración)
  quizConditions.push(or(isNull(quizzesTable.expiresAt), gt(quizzesTable.expiresAt, new Date())));

  // 4. Manejo de la búsqueda por texto
  if (queryTerm) {
    quizConditions.push(ilike(quizzesTable.title, `%${queryTerm}%`));
  }

  // Fetch quizzes and sessions
  const userQuizzes = await db.select()
    .from(quizzesTable)
    .where(and(...quizConditions))
    .orderBy(desc(quizzesTable.createdAt));

  // Calculate Stats
  const allUserQuizzes = await db.select().from(quizzesTable).where(eq(quizzesTable.userId, user.id));
  const totalPlays = allUserQuizzes.reduce((acc, q) => acc + (q.playCount || 0), 0);
  const totalQuestions = allUserQuizzes.reduce((acc, q) => acc + (q.questionCount || 0), 0);
  const globalReach = allUserQuizzes.length > 0 ? Math.round(totalPlays * 1.5) : 0;

  const userSessions = await db.select({
    session: multiplayerSessionsTable,
    quiz: quizzesTable,
  })
  .from(multiplayerSessionsTable)
  .innerJoin(quizzesTable, eq(multiplayerSessionsTable.quizId, quizzesTable.id))
  .where(eq(multiplayerSessionsTable.hostId, user.id))
  .orderBy(desc(multiplayerSessionsTable.startedAt));

  return (
    <DashboardUI 
      user={user}
      userQuizzes={userQuizzes}
      userSessions={userSessions}
      stats={{ totalPlays, totalQuestions, globalReach }}
      isPro={isPro}
      error={error}
      searchParams={searchParams}
    />
  );
}
