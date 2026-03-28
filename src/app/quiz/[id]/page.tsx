import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { quizzesTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { QuizLobbyUI } from "@/components/quiz/QuizLobbyUI";

export default async function QuizLobbyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const quizOpt = await db.select().from(quizzesTable)
    .where(isUuid ? eq(quizzesTable.id, id) : eq(quizzesTable.pinCode, id))
    .limit(1);
  if (!quizOpt.length) {
    return notFound();
  }
  const quiz = quizOpt[0];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Es el creador?
  const isAnonymousQuiz = quiz.userId === null;
  const isCreator = (user && quiz.userId === user.id) || isAnonymousQuiz;
  
  if (!isCreator) {
    redirect(`/join?pin=${quiz.pinCode}`);
  }

  // Chequear estado del plan del usuario para el componente cliente
  let isProOwner = false;
  if (user) {
    const creatorInfo = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
    if (creatorInfo.length && creatorInfo[0].plan === 'pro') {
      isProOwner = true;
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <QuizLobbyUI 
      quiz={{ ...quiz, isProOwner }} 
      user={user} 
      appUrl={appUrl} 
    />
  );
}
