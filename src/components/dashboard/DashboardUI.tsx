"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Play, Clock, Share2, PlusCircle, AlertCircle, BarChart3, Sparkles } from "lucide-react";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { useLanguage } from "@/context/LanguageContext";

interface DashboardUIProps {
  user: any;
  userQuizzes: any[];
  userSessions: any[];
  stats: {
    totalPlays: number;
    totalQuestions: number;
    globalReach: number;
  };
  isPro: boolean;
  error?: string;
  searchParams?: any;
}

export function DashboardUI({ user, userQuizzes, userSessions, stats, isPro, error, searchParams }: DashboardUIProps) {
  const { language, t } = useLanguage();
  const dashT = t('dashboard');
  const commonT = t('common');
  const homeT = t('home');

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 min-h-[calc(100vh-140px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">{dashT.title}</h1>
          <p className="text-muted-foreground text-lg font-medium">
            {language === 'es' ? `Hola, ${user.email?.split("@")[0]}. Aquí están tus tests.` : `Hello, ${user.email?.split("@")[0]}. Here are your tests.`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {isPro && (
            <form action="/api/checkout/portal" method="POST">
              <Button type="submit" variant="secondary" className="rounded-xl shadow-md border-2 font-bold h-12">
                {language === 'es' ? "Gestionar Suscripción" : "Manage Subscription"}
              </Button>
            </form>
          )}
          <Link href="/generate">
            <Button variant="outline" className="rounded-xl shadow-md w-full sm:w-auto border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 font-black h-12 px-6">
              <Sparkles className="mr-2 h-5 w-5" />
              {language === 'es' ? "Generar con IA" : "Generate with AI"}
            </Button>
          </Link>
          <Link href="/upload">
            <Button className="rounded-xl shadow-xl shadow-primary/20 w-full sm:w-auto font-black h-12 px-6 transition-transform active:scale-95">
              <PlusCircle className="mr-2 h-5 w-5" />
              {dashT.newQuiz}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <Card className="border-2 shadow-sm bg-gradient-to-br from-primary/5 to-background rounded-3xl overflow-hidden hover:shadow-md transition-all">
          <CardHeader className="pb-4">
            <CardDescription className="font-bold flex items-center gap-2 text-primary uppercase tracking-wider text-xs italic"><Play className="w-4 h-4" /> {language === 'es' ? "Total de Jugadas" : "Total Plays"}</CardDescription>
            <CardTitle className="text-5xl font-black">{stats.totalPlays}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 shadow-sm bg-gradient-to-br from-purple-500/5 to-background rounded-3xl overflow-hidden hover:shadow-md transition-all">
          <CardHeader className="pb-4">
            <CardDescription className="font-bold flex items-center gap-2 text-purple-600 uppercase tracking-wider text-xs italic"><BarChart3 className="w-4 h-4" /> {language === 'es' ? "Alcance Global" : "Global Reach"}</CardDescription>
            <CardTitle className="text-5xl font-black">{stats.globalReach}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 shadow-sm bg-gradient-to-br from-success/5 to-background rounded-3xl overflow-hidden hover:shadow-md transition-all">
          <CardHeader className="pb-4">
            <CardDescription className="font-bold flex items-center gap-2 text-success uppercase tracking-wider text-xs italic"><FileText className="w-4 h-4" /> {language === 'es' ? "Contenido Creado" : "Content Created"}</CardDescription>
            <CardTitle className="text-5xl font-black">{stats.totalQuestions} <span className="text-sm font-black text-muted-foreground uppercase">{commonT.questions}</span></CardTitle>
          </CardHeader>
        </Card>
      </div>

      <DashboardFilters />

      <div className="my-8">
        {error === 'NoStripeCustomer' && (
          <div className="p-4 bg-destructive/10 border-2 border-destructive/20 rounded-2xl text-destructive flex items-center gap-4 animate-in shake duration-300">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <p className="text-sm font-bold">{language === 'es' ? "Error con Stripe: No se encontró el ID de cliente." : "Stripe error: Customer ID not found."}</p>
          </div>
        )}
      </div>

      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="mb-8 h-auto p-1.5 bg-muted/50 rounded-2xl grid grid-cols-2 w-full sm:w-[450px] border-2 shadow-inner">
          <TabsTrigger value="quizzes" className="rounded-xl py-3 font-black transition-all data-[state=active]:shadow-md"><FileText className="w-5 h-5 mr-2" /> {language === 'es' ? "Mis Tests" : "My Tests"}</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-xl py-3 font-black transition-all data-[state=active]:shadow-md"><BarChart3 className="w-5 h-5 mr-2" /> {language === 'es' ? "Reportes Finales" : "Final Reports"}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quizzes" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {userQuizzes.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed border-4 shadow-none bg-muted/10 rounded-[3rem]">
              <div className="p-6 bg-primary/10 rounded-3xl mb-6 shadow-inner">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-black mb-3">{dashT.noQuizzes}</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto font-medium">
                {language === 'es' ? "Sube tu primer documento y deja que la IA haga su magia." : "Upload your first document and let the AI do its magic."}
              </p>
              <Link href="/upload">
                <Button variant="default" className="shadow-xl shadow-primary/20 rounded-2xl px-10 h-14 text-lg font-black">
                  {language === 'es' ? "Empezar ahora" : "Start now"}
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userQuizzes.map((quiz) => (
                <Card key={quiz.id} className="flex flex-col border-2 hover:border-primary/40 hover:shadow-2xl transition-all bg-card/50 backdrop-blur-sm rounded-[2rem] overflow-hidden group">
                  <CardHeader className="pb-4 bg-muted/20 border-b group-hover:bg-primary/5 transition-colors">
                    <CardTitle className="text-2xl font-black line-clamp-2 leading-none h-[3rem] pt-1" title={quiz.title}>
                      {quiz.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-4 font-bold">
                      <span className="flex items-center text-xs bg-background px-3 py-1.5 rounded-full border shadow-sm">
                        <FileText className="mr-2 h-4 w-4 text-primary" />
                        {quiz.questionCount}
                      </span>
                      <span className="flex items-center text-xs text-muted-foreground uppercase tracking-widest italic">
                        <Clock className="mr-2 h-3.5 w-3.5" />
                        {new Date(quiz.createdAt || "").toLocaleDateString()}
                      </span>
                      {quiz.expiresAt && (
                        <span className="flex items-center text-[10px] text-destructive font-black uppercase tracking-tighter bg-destructive/5 px-2 py-1 rounded-md animate-pulse">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {language === 'es' ? "Caduca hoy" : "Expires today"}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6 px-6">
                    <div className="text-xs font-black text-muted-foreground/70 bg-muted/40 p-3 rounded-2xl line-clamp-1 border-2 border-dashed flex items-center gap-3 italic" title={quiz.sourceFileUrl || "..."}>
                      <span className="text-xl grayscale group-hover:grayscale-0 transition-all">📄</span> {quiz.sourceFileUrl || "..."}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex gap-3 pb-6 px-6 flex-wrap mt-auto">
                    <Link href={`/quiz/${quiz.id}`} className="flex-1 min-w-[120px]">
                      <Button variant="default" className="w-full shadow-lg shadow-primary/10 font-black rounded-xl h-12 transition-transform active:scale-95">
                        <Play className="mr-2 h-5 w-5" />
                        {homeT?.playBtn || "Play"}
                      </Button>
                    </Link>
                    <Link href={`/quiz/${quiz.id}/admin`}>
                      <Button variant="outline" className="shadow-sm font-black rounded-xl h-12 border-2 px-5 hover:bg-muted">
                         Admin
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {userSessions.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed border-4 shadow-none bg-muted/10 rounded-[3rem]">
              <div className="p-6 bg-primary/10 rounded-3xl mb-6 shadow-inner">
                <BarChart3 className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-black mb-3">{language === 'es' ? "No hay reportes aún" : "No reports yet"}</h2>
              <p className="text-muted-foreground max-w-md mx-auto font-medium">
                {language === 'es' ? "Inicia una partida multijugador para ver los resultados aquí." : "Start a multiplayer game to see the results here."}
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {userSessions.map(({session, quiz}) => (
                <Card key={session.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-2 shadow-xl rounded-[2rem] hover:shadow-2xl transition-shadow bg-card/50">
                   <div className="flex-1 space-y-3">
                     <div className="inline-flex items-center rounded-full border-2 bg-primary/5 px-4 py-1 text-xs font-black text-primary uppercase tracking-widest shadow-sm">
                        {session.playersCount} {language === 'es' ? "Jugadores" : "Players"}
                     </div>
                     <h3 className="font-black text-3xl leading-tight text-balance">{quiz.title}</h3>
                     <p className="text-sm text-muted-foreground flex items-center gap-2 font-bold italic">
                       <Clock className="w-4 h-4" /> {new Date(session.startedAt).toLocaleString()}
                     </p>
                   </div>
                   <div className="bg-muted/30 border-2 border-dashed p-6 rounded-[2rem] w-full lg:w-[400px] shrink-0 shadow-inner">
                     <p className="font-black text-sm mb-4 text-muted-foreground flex items-center gap-2 uppercase tracking-tighter">🏆 {language === 'es' ? "Podio de la Partida" : "Game Podium"}</p>
                     <div className="space-y-2">
                       {Object.entries(session.leaderboard as any || {})
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .slice(0, 3)
                          .map(([name, score], i) => (
                            <div key={name} className="flex justify-between items-center bg-background rounded-2xl px-4 py-3 shadow-md border-2 border-primary/5">
                              <span className="font-black text-sm flex items-center gap-3">
                                 <span className={`rounded-xl w-7 h-7 flex items-center justify-center text-xs font-black shadow-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400/20' : i === 1 ? 'bg-gray-200 text-gray-700 ring-2 ring-gray-400/20' : i === 2 ? 'bg-amber-100/50 text-amber-900 ring-2 ring-amber-400/20' : 'bg-primary/10 text-primary'}`}>
                                   {i+1}
                                 </span>
                                 {name}
                              </span>
                              <span className="font-black text-lg text-primary">{String(score)} pts</span>
                            </div>
                        ))}
                        {Object.keys(session.leaderboard as any || {}).length === 0 && (
                          <p className="italic text-muted-foreground text-sm font-bold text-center py-4 bg-background rounded-2xl border-2 border-dashed">{language === 'es' ? "Incompleto / Sin puntos" : "Incomplete / No points"}</p>
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
