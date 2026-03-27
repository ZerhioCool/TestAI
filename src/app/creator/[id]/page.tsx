import { db } from "@/db";
import { quizzesTable, usersTable } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Play, Clock, Trophy, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const creatorId = resolvedParams.id;

  const creatorInfo = await db.select().from(usersTable).where(eq(usersTable.id, creatorId)).limit(1);
  if (creatorInfo.length === 0) {
    return notFound();
  }

  const creator = creatorInfo[0];

  const publicQuizzes = await db.select()
    .from(quizzesTable)
    .where(and(eq(quizzesTable.userId, creatorId), eq(quizzesTable.isPublic, true)))
    .orderBy(desc(quizzesTable.playCount), desc(quizzesTable.createdAt));

  const totalPlays = publicQuizzes.reduce((acc, q) => acc + (q.playCount || 0), 0);

  return (
    <div className="container max-w-6xl mx-auto py-20 px-4 min-h-screen">
      <div className="flex flex-col items-center text-center mb-16 space-y-6">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white shadow-2xl border-4 border-background">
          <User className="h-16 w-16" />
        </div>
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-2">{creator.fullName || creator.email?.split("@")[0] || "Creador"}</h1>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-primary">{publicQuizzes.length}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quizzes</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-primary">{totalPlays}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Plays</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {publicQuizzes.map((quiz) => (
          <Card key={quiz.id} className="group flex flex-col border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden">
            <div className="h-28 bg-muted/30 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
              <FileText className="h-10 w-10 text-primary/40 group-hover:text-primary transition-colors" />
            </div>
            <CardHeader className="pb-4 relative">
              <div className="absolute -top-6 right-6">
                <div className="bg-background border-2 border-primary/20 rounded-full px-4 py-1 flex items-center gap-2 shadow-lg">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-black text-sm">{quiz.playCount || 0}</span>
                </div>
              </div>
              <CardTitle className="text-xl line-clamp-2 leading-tight font-black" title={quiz.title}>
                {quiz.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2 font-bold text-muted-foreground/80">
                <span className="flex items-center">
                  <Clock className="mr-1.5 h-3.5 w-3.5" />
                  {quiz.questionCount} P.
                </span>
                <span>{new Date(quiz.createdAt || "").toLocaleDateString()}</span>
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto px-6 pb-6 pt-0">
              <Link href={`/quiz/${quiz.id}`} className="w-full">
                <Button variant="outline" className="w-full h-11 border-2 font-black text-sm rounded-xl">
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  Jugar
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {publicQuizzes.length === 0 && (
        <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed">
          <p className="text-muted-foreground font-bold">Este creador no tiene quizzes públicos todavía.</p>
        </div>
      )}
    </div>
  );
}
