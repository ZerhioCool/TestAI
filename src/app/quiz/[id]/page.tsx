import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from 'qrcode.react';
import { db } from "@/db";
import { quizzesTable, usersTable } from "@/db/schema";
import { or, eq } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown, Play, Share2 } from "lucide-react";

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

  // Es el creador? (Si userId es null, significa que es un quiz anónimo recién creado)
  const isAnonymousQuiz = quiz.userId === null;
  const isCreator = (user && quiz.userId === user.id) || isAnonymousQuiz;
  
  if (!isCreator) {
    // Invitados a una sala de otra persona via url
    redirect(`/join?pin=${quiz.pinCode}`);
  }

  // Chequear estado del plan del usuario
  let isPro = false;
  if (user) {
    const creatorInfo = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
    if (creatorInfo.length && creatorInfo[0].plan === 'pro') {
      isPro = true;
    }
  }

  const isMultiplayerUnlocked = isPro || quiz.isUnlocked;
  
  // URL absoluta dinámica para el QR (para desarrollo asume localhost)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const joinUrl = `${appUrl}/join?pin=${quiz.pinCode}`;

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center rounded-full border bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Lobby del Creador
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
          {quiz.title}
        </h1>
        <p className="text-xl text-muted-foreground">
          {quiz.questionCount} Preguntas • Generado por TestAI
        </p>
        {isCreator && (
          <div className="pt-2">
            <Link href={`/quiz/${quiz.id}/edit`}>
              <Button variant="outline" size="sm" className="rounded-full shadow-sm border-2 hover:bg-primary/5 hover:text-primary transition-all">
                ✏️ Editar Cuestionario
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Panel 1: Jugar Solo */}
        <Card className="border-2 shadow-sm flex flex-col h-full hover:border-primary/50 transition-colors">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto bg-muted p-4 rounded-full mb-4">
              <Play className="h-8 w-8 text-foreground" />
            </div>
            <CardTitle className="text-2xl">
               {isAnonymousQuiz ? "Guardar y Entrenar" : "Entrenar Solo"}
            </CardTitle>
            <CardDescription className="text-base text-balance mt-2">
              {isAnonymousQuiz 
                ? "Regístrate gratis para guardar este quiz en tu cuenta y comenzar a practicar."
                : "Juega este quiz de forma individual para repasar, estudiar o memorizar el contenido."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
            <Link href={`/quiz/${quiz.id}/play`} className="w-full">
              <Button className="w-full text-lg h-14" size="lg">
                {isAnonymousQuiz ? "Crear Cuenta Gratis" : "Comenzar Práctica"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Panel 2: Multijugador (Compartir) */}
        <Card className={`border-2 shadow-sm flex flex-col h-full transition-all ${isMultiplayerUnlocked ? 'border-success/50 bg-success/5' : 'border-amber-500/30'}`}>
          <CardHeader className="text-center pb-2">
            <div className={`mx-auto p-4 rounded-full mb-4 ${isMultiplayerUnlocked ? 'bg-success/20 text-success' : 'bg-amber-500/10 text-amber-600'}`}>
              <Users className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Competencia en Grupo</CardTitle>
            <CardDescription className="text-base text-balance mt-2">
              Invita a tus estudiantes o amigos a unirse en vivo desde sus teléfonos usando un PIN o QR.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-grow flex flex-col items-center justify-center p-6 text-center">
            
            {isMultiplayerUnlocked ? (
              <div className="animate-in fade-in zoom-in duration-500 space-y-6 w-full">
                <div className="bg-background rounded-xl p-6 border shadow-sm flex flex-col items-center">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">PIN DE ACCESO</p>
                  <p className="text-6xl font-black tracking-widest text-primary font-mono">{quiz.pinCode}</p>
                </div>
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm border">
                     <QRCodeSVG value={joinUrl} size={140} level="H" includeMargin={false} />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Escanea con tu cámara o entra a <br/><span className="text-primary font-bold">{appUrl}/join</span></p>
                </div>
                  
                  <Link href={`/quiz/${quiz.id}/admin`} className="w-full pt-4">
                    <Button className="w-full text-lg h-14 bg-primary hover:bg-primary/90" size="lg">
                      Iniciar como Administrador
                    </Button>
                  </Link>
                </div>
            ) : isAnonymousQuiz ? (
              <div className="w-full space-y-4">
                <div className="bg-amber-500/10 text-amber-800 p-4 rounded-xl text-sm font-medium border border-amber-500/20 mb-6">
                  🔥 El modo multijugador es exclusivo. Desbloquea esta sala para jugar con amigos y ver quién saca la mejor nota.
                </div>
                <Link href="/register" className="w-full block">
                  <Button className="w-full text-lg h-14 bg-amber-500 hover:bg-amber-600 text-white" size="lg">
                    Regístrate para Desbloquear
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="bg-amber-500/10 text-amber-800 p-4 rounded-xl text-sm font-medium border border-amber-500/20 mb-6">
                  🔥 El modo multijugador es exclusivo. Desbloquea esta sala para jugar con amigos y ver quién saca la mejor nota.
                </div>
                
                <form action="/api/checkout/pass" method="POST">
                  <input type="hidden" name="quizId" value={quiz.id} />
                  <Button type="submit" variant="outline" className="w-full h-auto py-4 border-2 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 group">
                    <span className="text-lg font-bold">Pase Único - $0.99</span>
                    <span className="text-xs text-muted-foreground font-normal">Hasta 10 jugadores para este Quiz</span>
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-bold">o la mejor oferta</span>
                  </div>
                </div>

                <form action="/api/checkout/pro" method="POST">
                  <Button type="submit" className="w-full h-auto py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-none flex flex-col items-center justify-center gap-1 shadow-md shadow-indigo-500/20 text-white">
                    <span className="text-lg font-bold flex items-center gap-2"><Crown className="h-5 w-5"/> Plan Pro - $4.99/mes</span>
                    <span className="text-xs text-indigo-100 font-normal">Quizzes y Jugadores Ilimitados en todo TestAI</span>
                  </Button>
                </form>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
