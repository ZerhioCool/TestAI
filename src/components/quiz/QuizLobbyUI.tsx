"use client";

import Link from "next/link";
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown, Play } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface QuizLobbyProps {
  quiz: any;
  user: any;
  appUrl: string;
}

export function QuizLobbyUI({ quiz, user, appUrl }: QuizLobbyProps) {
  const { language, t } = useLanguage();
  const lobT = t('lobby');
  
  const isAnonymousQuiz = quiz.userId === null;
  const isCreator = (user && quiz.userId === user.id) || isAnonymousQuiz;
  const isPro = user?.user_metadata?.plan === 'pro'; // This might need server-side plan check passed as prop
  
  // Real check should come from props
  const isMultiplayerUnlocked = quiz.isUnlocked || (user && quiz.isProOwner); 

  const joinUrl = `${appUrl}/join?pin=${quiz.pinCode}`;

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="text-center space-y-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center rounded-full border bg-primary/10 px-4 py-1.5 text-sm font-black text-primary uppercase tracking-wider">
          {lobT.title}
        </div>
        <p className="text-xl text-muted-foreground font-medium">
          {quiz.questionCount} {t('common').questions} • QuickAITest
        </p>
        {isCreator && (
          <div className="pt-2">
            <Link href={`/quiz/${quiz.id}/edit`}>
              <Button variant="outline" size="sm" className="rounded-full shadow-sm border-2 hover:bg-primary/5 hover:text-primary transition-all font-bold px-6">
                ✏️ {lobT.editQuiz}
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Panel 1: Jugar Solo */}
        <Card className="border-2 shadow-xl flex flex-col h-full hover:border-primary/50 transition-all rounded-[2.5rem] overflow-hidden group">
          <CardHeader className="text-center pb-4 transition-colors group-hover:bg-primary/5">
            <div className="mx-auto bg-muted p-5 rounded-3xl mb-4 shadow-inner group-hover:scale-110 transition-transform">
              <Play className="h-10 w-10 text-foreground fill-foreground/10" />
            </div>
            <CardTitle className="text-3xl font-black">
               {isAnonymousQuiz ? (language === 'es' ? "Guardar y Entrenar" : "Save & Practice") : lobT.soloTitle}
            </CardTitle>
            <CardDescription className="text-lg text-balance mt-3 font-medium">
              {isAnonymousQuiz 
                ? (language === 'es' ? "Regístrate gratis para guardar este test." : "Register for free to save this test.")
                : lobT.soloDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end p-8">
            <Link href={`/quiz/${quiz.id}/play`} className="w-full">
              <Button className="w-full text-xl h-16 rounded-2xl shadow-xl shadow-primary/20 font-black transition-transform active:scale-95" size="lg">
                {isAnonymousQuiz ? (language === 'es' ? "Crear Cuenta Gratis" : "Create Free Account") : lobT.soloBtn}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Panel 2: Multijugador (Compartir) */}
        <Card className={`border-2 shadow-xl flex flex-col h-full transition-all rounded-[2.5rem] overflow-hidden ${isMultiplayerUnlocked ? 'border-success/50 bg-success/5' : 'border-amber-500/30'}`}>
          <CardHeader className="text-center pb-2">
            <div className={`mx-auto p-5 rounded-3xl mb-4 shadow-inner ${isMultiplayerUnlocked ? 'bg-success/20 text-success' : 'bg-amber-500/10 text-amber-600'}`}>
              <Users className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-black">{lobT.multiTitle}</CardTitle>
            <CardDescription className="text-lg text-balance mt-3 font-medium">
              {lobT.multiDesc}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-grow flex flex-col items-center justify-center p-8 text-center">
            
            {isMultiplayerUnlocked ? (
              <div className="animate-in fade-in zoom-in duration-500 space-y-8 w-full">
                <div className="bg-background rounded-[2rem] p-8 border-2 shadow-inner flex flex-col items-center">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] mb-3">{lobT.pinTitle}</p>
                  <p className="text-7xl font-black tracking-widest text-primary font-mono select-all">
                    {quiz.pinCode}
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 bg-white rounded-3xl shadow-xl border-4 border-white ring-2 ring-primary/10">
                     <QRCodeSVG value={joinUrl} size={160} level="H" includeMargin={false} />
                  </div>
                  <p className="text-sm text-muted-foreground font-bold leading-relaxed">
                    {lobT.qrSubtitle} <br/>
                    <span className="text-primary font-black text-lg underline decoration-2 underline-offset-4">{appUrl.replace('https://', '')}/join</span>
                  </p>
                </div>
                  
                  <Link href={`/quiz/${quiz.id}/admin`} className="w-full pt-4">
                    <Button className="w-full text-xl h-16 bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 font-black" size="lg">
                      {lobT.multiBtn}
                    </Button>
                  </Link>
                </div>
            ) : (
              <div className="w-full space-y-6">
                <div className="bg-amber-500/10 text-amber-900 p-6 rounded-[2rem] text-sm font-bold border-2 border-amber-500/20 leading-relaxed shadow-inner">
                  🔥 {lobT.lockedNotice}
                </div>
                
                <div className="space-y-3">
                  <form action="/api/checkout/pass" method="POST">
                    <input type="hidden" name="quizId" value={quiz.id} />
                    <Button type="submit" variant="outline" className="w-full h-auto py-5 border-4 rounded-2xl hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 group transition-all">
                      <span className="text-xl font-black">{lobT.buyPass}</span>
                      <span className="text-sm text-muted-foreground font-bold">
                        {language === 'es' ? "Hasta 10 jugadores para este Test" : "Up to 10 players for this Test"}
                      </span>
                    </Button>
                  </form>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t-2" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-4 text-muted-foreground font-black tracking-widest">OR THE BEST DEAL</span>
                    </div>
                  </div>

                  <form action="/api/checkout/pro" method="POST">
                    <Button type="submit" className="w-full h-auto py-5 bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 border-none rounded-2xl flex flex-col items-center justify-center gap-1 shadow-2xl shadow-indigo-500/30 text-white transition-all active:scale-95">
                      <span className="text-xl font-black flex items-center gap-2"><Crown className="h-6 w-6 fill-yellow-400 text-yellow-500"/> {lobT.buyPro}</span>
                      <span className="text-sm text-indigo-100 font-bold">
                        {language === 'es' ? "Tests Ilimitados y hasta 50 jugadores" : "Unlimited Tests & up to 50 players"}
                      </span>
                    </Button>
                  </form>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
