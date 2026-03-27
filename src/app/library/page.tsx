import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { quizzesTable, usersTable } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Play, Clock, Search, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function LibraryPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const queryTerm = (searchParams?.q as string) || "";
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch only public quizzes
  let conditions = [eq(quizzesTable.isPublic, true)];
  
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

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 min-h-screen">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Explora la Biblioteca
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Descubre miles de quizzes creados por la comunidad y pon a prueba tus conocimientos.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12 relative">
        <form action="/library" method="GET" className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-5 w-5" />
          <Input 
            name="q"
            placeholder="Busca por tema, materia o título..." 
            defaultValue={queryTerm}
            className="h-14 pl-12 pr-4 text-lg rounded-2xl border-2 focus:ring-primary shadow-sm bg-background/50 backdrop-blur-sm"
          />
          <Button type="submit" className="absolute right-2 top-2 h-10 rounded-xl font-bold">
            Buscar
          </Button>
        </form>
      </div>

      {publicQuizzes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-20 text-center border-dashed border-2 bg-muted/20 rounded-3xl">
          <Search className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <h2 className="text-2xl font-bold mb-2">No encontramos nada</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            No hay quizzes públicos que coincidan con tu búsqueda. ¡Prueba con otro término!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publicQuizzes.map(({ quiz, creator }) => (
            <Card key={quiz.id} className="group flex flex-col border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-purple-500/20 transition-colors">
                <div className="bg-background p-4 rounded-2xl shadow-sm border border-primary/10">
                   <FileText className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardHeader className="pb-4 relative">
                <div className="absolute -top-6 right-6">
                  <div className="bg-background border-2 border-primary/20 rounded-full px-4 py-1 flex items-center gap-2 shadow-lg">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-black text-sm">{quiz.playCount || 0} plays</span>
                  </div>
                </div>
                <CardTitle className="text-2xl line-clamp-2 leading-tight font-black" title={quiz.title}>
                  {quiz.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2 font-bold text-muted-foreground/80">
                  <span className="flex items-center">
                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                    {quiz.questionCount} Preguntas
                  </span>
                  {creator && (
                    <Link href={`/creator/${quiz.userId}`} className="truncate hover:text-primary transition-colors underline-offset-4 hover:underline decoration-primary/30">
                      Por {creator}
                    </Link>
                  )}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto px-6 pb-8 gap-3">
                <Link href={`/quiz/${quiz.id}`} className="flex-1">
                  <Button variant="default" className="w-full h-12 shadow-md font-black text-base rounded-xl transition-transform active:scale-95">
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    ¡Jugar Ahora!
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
