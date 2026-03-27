import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { quizzesTable, usersTable, multiplayerSessionsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Play, Clock, Share2, PlusCircle, AlertCircle, BarChart3, Sparkles } from "lucide-react";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { ilike, and, or } from "drizzle-orm";

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
  let quizConditions = [];
  
  // 1. Manejo del tipo de filtro
  if (filterType === "mine") {
    quizConditions.push(eq(quizzesTable.userId, user.id));
  } else if (filterType === "public") {
    quizConditions.push(eq(quizzesTable.isPublic, true));
  } else {
    // 'all' = Míos o públicos
    quizConditions.push(or(eq(quizzesTable.userId, user.id), eq(quizzesTable.isPublic, true)));
  }

  // 2. Manejo de la búsqueda por texto
  if (queryTerm) {
    quizConditions.push(ilike(quizzesTable.title, `%${queryTerm}%`));
  }

  // Fetch quizzes and sessions
  console.log("Fetching userQuizzes...");
  const userQuizzes = await db.select()
    .from(quizzesTable)
    .where(and(...quizConditions))
    .orderBy(desc(quizzesTable.createdAt));

  // Calculate Stats
  const allUserQuizzes = await db.select().from(quizzesTable).where(eq(quizzesTable.userId, user.id));
  const totalPlays = allUserQuizzes.reduce((acc, q) => acc + (q.playCount || 0), 0);
  const totalQuestions = allUserQuizzes.reduce((acc, q) => acc + (q.questionCount || 0), 0);
  const globalReach = allUserQuizzes.length > 0 ? Math.round(totalPlays * 1.5) : 0; // Simulated reach metric or unique players if available

  console.log("Fetching userSessions...");
  const userSessions = await db.select({
    session: multiplayerSessionsTable,
    quiz: quizzesTable,
  })
  .from(multiplayerSessionsTable)
  .innerJoin(quizzesTable, eq(multiplayerSessionsTable.quizId, quizzesTable.id))
  .where(eq(multiplayerSessionsTable.hostId, user.id))
  .orderBy(desc(multiplayerSessionsTable.startedAt));
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 min-h-[calc(100vh-140px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
          <p className="text-muted-foreground">
            Hola, {user.email?.split("@")[0]}. Aquí están tus cuestionarios guardados.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {isPro && (
            <form action="/api/checkout/portal" method="POST">
              <Button type="submit" variant="secondary" className="shadow-sm border">
                Gestionar Suscripción
              </Button>
            </form>
          )}
          <Link href="/generate">
            <Button variant="outline" className="shadow-sm w-full sm:w-auto border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 font-bold">
              <Sparkles className="mr-2 h-4 w-4" />
              Generar con IA
            </Button>
          </Link>
          <Link href="/upload">
            <Button className="shadow-sm w-full sm:w-auto font-bold">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nuevo Quiz
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-2 shadow-sm bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold flex items-center gap-2"><Play className="w-4 h-4 text-primary" /> Total de Jugadas</CardDescription>
            <CardTitle className="text-4xl font-black">{totalPlays}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 shadow-sm bg-gradient-to-br from-purple-500/5 to-background">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-600" /> Alcance Global</CardDescription>
            <CardTitle className="text-4xl font-black">{globalReach}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 shadow-sm bg-gradient-to-br from-success/5 to-background">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-success" /> Contenido Creado</CardDescription>
            <CardTitle className="text-4xl font-black">{totalQuestions} <span className="text-sm font-bold text-muted-foreground uppercase">Preguntas</span></CardTitle>
          </CardHeader>
        </Card>
      </div>

      <DashboardFilters />

      {error === 'NoStripeCustomer' && (
        <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">Tu cuenta no tiene un ID de cliente de Stripe asociado (cus_...). Probablemente tu plan fue asignado manualmente o el webhook no capturó el pago. Realiza un pago de prueba para generar el ID.</p>
        </div>
      )}

      {error === 'StripePortalError' && (
        <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">Ocurrió un error al intentar comunicar con Stripe. Por favor inténtalo más tarde.</p>
        </div>
      )}

      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="mb-6 h-auto p-1 bg-muted/50 rounded-xl grid grid-cols-2 w-full sm:w-[400px]">
          <TabsTrigger value="quizzes" className="rounded-lg py-2 font-bold"><FileText className="w-4 h-4 mr-2" /> Mis Quizzes</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg py-2 font-bold"><BarChart3 className="w-4 h-4 mr-2" /> Reportes Finales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quizzes" className="mt-0">
          {userQuizzes.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 shadow-none bg-muted/20 rounded-2xl">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Aún no tienes cuestionarios</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Sube tu primer documento PDF o imagen de tus apuntes y la Inteligencia Artificial generará tu primer quiz mágico.
              </p>
              <Link href="/upload">
                <Button variant="default" className="shadow-md">Empezar ahora</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userQuizzes.map((quiz) => (
                <Card key={quiz.id} className="flex flex-col border-2 hover:border-primary/50 hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4 bg-muted/30">
                    <CardTitle className="text-xl line-clamp-2 leading-tight h-[2.5rem]" title={quiz.title}>
                      {quiz.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-3 font-medium">
                      <span className="flex items-center text-xs bg-background px-2 py-1 rounded-md border shadow-sm">
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        {quiz.questionCount} P.
                      </span>
                      <span className="flex items-center text-xs">
                        <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(quiz.createdAt || "").toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pt-4">
                    <div className="text-xs font-semibold text-muted-foreground bg-muted p-2 rounded-lg line-clamp-1 border flex items-center gap-2" title={quiz.sourceFileUrl || "Archivo desconocido"}>
                      <span className="text-lg">📄</span> {quiz.sourceFileUrl || "Origen desconocido"}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2 pb-5 px-6 flex-wrap">
                    <Link href={`/quiz/${quiz.id}`} className="flex-1 min-w-[100px]">
                      <Button variant="default" className="w-full shadow-md font-bold text-sm">
                        <Play className="mr-2 h-4 w-4" />
                        Jugar / Live
                      </Button>
                    </Link>
                    <Link href={`/quiz/${quiz.id}/admin`}>
                      <Button variant="outline" className="shadow-sm font-bold text-sm border-2">
                         Control
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon" title="Compartir enlace" className="border-2 text-muted-foreground hover:text-foreground shrink-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          {userSessions.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 shadow-none bg-muted/20 rounded-2xl">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No hay reportes de juego</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Inicia una partida multijugador y finalízala para que TestAI registre automáticamente las puntuaciones de la clase aquí.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {userSessions.map(({session, quiz}) => (
                <Card key={session.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 border-2 shadow-sm rounded-2xl">
                   <div className="flex-1">
                     <div className="inline-flex items-center rounded-full border bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary mb-2 shadow-sm">
                        {session.playersCount} Jugadores
                     </div>
                     <h3 className="font-extrabold text-xl leading-tight text-balance">{quiz.title}</h3>
                     <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                       <Clock className="w-4 h-4" /> {new Date(session.startedAt).toLocaleString()}
                     </p>
                   </div>
                   <div className="bg-muted/50 border p-4 rounded-xl w-full md:w-[350px] shrink-0">
                     <p className="font-bold text-sm mb-3 text-muted-foreground flex items-center gap-2">🏆 Podio de la Partida</p>
                     <div className="space-y-1.5">
                       {Object.entries(session.leaderboard as any || {})
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .slice(0, 3)
                          .map(([name, score], i) => (
                            <div key={name} className="flex justify-between items-center bg-background rounded-lg px-3 py-2 shadow-sm border border-border/50">
                              <span className="font-bold text-sm flex items-center gap-3">
                                 <span className={`rounded-full w-5 h-5 flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-amber-100/50 text-amber-900' : 'bg-primary/10 text-primary'}`}>
                                   {i+1}
                                 </span>
                                 {name}
                              </span>
                              <span className="font-black text-sm text-primary">{String(score)} pts</span>
                            </div>
                        ))}
                        {Object.keys(session.leaderboard as any || {}).length === 0 && (
                          <p className="italic text-muted-foreground text-sm font-medium text-center py-2 bg-background rounded-lg border border-dashed">Nadie obtuvo puntos.</p>
                        )}
                     </div>
                   </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
