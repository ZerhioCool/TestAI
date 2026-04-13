"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useAudio } from "@/hooks/use-audio";
import { AudioToggle } from "@/components/shared/AudioToggle";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Trophy, Volume2 } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export default function PlayerLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { language, t } = useLanguage();
  const plT = t('player');
  const commonT = t('common');

  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const guestName = searchParams.get("guest") || (language === 'es' ? "Jugador" : "Player");
  const supabase = createClient();
  const { isPlaying, toggleMusic, playOneShot } = useAudio();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [status, setStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      const qRes = await fetch(`/api/quiz/${resolvedParams.id}`);
      const qData = await qRes.json();
      if (qData.quiz) setQuiz(qData.quiz);
      if (qData.questions) setQuestions(qData.questions);

      const channel = supabase.channel(`live-session-broadcast-${resolvedParams.id}`)
        .on('broadcast', { event: 'game-start' }, (payload: any) => {
          setStatus('playing');
          setCurrentIndex(0);
          setHasAnswered(false);
          setTimeLeft(payload.payload.timeLimit || 10);
        })
        .on('broadcast', { event: 'next-question' }, (payload: any) => {
          setCurrentIndex(payload.payload.index);
          setHasAnswered(false);
          setTimeLeft(payload.payload.timeLimit || 10);
        })
        .on('broadcast', { event: 'game-end' }, () => {
          setStatus('finished');
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFFFFF', '#6366f1']
          });
          playOneShot("finish");
        })
        .subscribe(async (subStatus: any) => {
          if (subStatus === 'SUBSCRIBED') {
            await channel.track({ name: guestName, joinedAt: Date.now() });
          }
        });
      
      channelRef.current = channel;
      setLoading(false);
    }
    init();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [resolvedParams.id, guestName, playOneShot]); // Removed supabase as it is now a stable singleton proxy

  useEffect(() => {
    if (status === 'playing' && timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'playing' && timeLeft === 0 && !hasAnswered) {
      setHasAnswered(true);
    }
  }, [timeLeft, status, hasAnswered]);

  const handleAnswer = (optionId: string) => {
    if (hasAnswered) return;
    setHasAnswered(true);

    const currentQuestion = questions[currentIndex];
    const currentAnswer = currentQuestion?.correctAnswer;
    const isCorrect = Array.isArray(currentAnswer)
      ? currentAnswer.includes(optionId)
      : String(currentAnswer) === String(optionId);
      
    if (channelRef.current) {
      // Cálculo de puntos: Base 1000 + Bonus por velocidad (hasta 500)
      const basePoints = 1000;
      const speedBonus = isCorrect ? Math.round((timeLeft || 0) / 10 * 500) : 0;
      const pointsGot = isCorrect ? basePoints + speedBonus : 0;
      
      const newScore = score + pointsGot;
      if (isCorrect) setScore(newScore);
      
      if (isCorrect) playOneShot("success");
      else playOneShot("error");

      channelRef.current.send({
        type: 'broadcast',
        event: 'answer-submitted',
        payload: { name: guestName, score: newScore }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'waiting') {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <AudioToggle isPlaying={isPlaying} onToggle={toggleMusic} />
        </div>
        <div className="space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="bg-white/20 p-8 rounded-full inline-block mb-4 shadow-xl">
            <Users className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-black">{plT.inGame}, {guestName}!</h1>
          <p className="text-xl opacity-90">{plT.waitingForHostAction}</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
     return (
       <div className="min-h-screen flex items-center justify-center bg-muted/20 p-6 relative">
         <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <AudioToggle isPlaying={isPlaying} onToggle={toggleMusic} />
        </div>
         <Card className="max-w-2xl w-full text-center p-8 border-t-4 border-t-primary shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in duration-500 max-h-[90vh] flex flex-col">
           <div className="shrink-0">
             <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
             <h2 className="text-3xl font-bold mb-2">{plT.gameOver}</h2>
             <p className="text-3xl font-black text-primary mb-2 mt-4">{score} pts</p>
             <p className="text-muted-foreground mb-8">{plT.gamePodiumNotice}</p>
           </div>

           <div className="flex-grow overflow-y-auto space-y-6 text-left pr-2 custom-scrollbar pb-8">
             <h3 className="text-2xl font-black flex items-center gap-3 italic border-b-2 pb-2">
               📖 {language === 'es' ? "Revisión de Respuestas" : "Answer Review"}
             </h3>
             {questions.map((q, idx) => (
               <div key={q.id} className="p-5 bg-background rounded-2xl border-2 shadow-sm space-y-3">
                  <p className="font-bold text-md leading-tight">
                    <span className="text-primary mr-2 font-black italic">#{idx+1}</span> {q.questionText}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt: any) => {
                      const isCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(opt.id) : q.correctAnswer === opt.id;
                      return (
                        <span key={opt.id} className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2",
                          isCorrect ? "bg-success/10 border-success text-success" : "bg-muted border-transparent text-muted-foreground opacity-60"
                        )}>
                          {opt.id}: {opt.text}
                        </span>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="p-3 bg-primary/5 rounded-xl text-xs italic font-medium border-l-4 border-primary">
                      {q.explanation}
                    </div>
                  )}
               </div>
             ))}
           </div>

           <Button onClick={() => router.push('/')} className="w-full h-14 text-lg font-black rounded-2xl shadow-lg shadow-primary/20 mt-4 shrink-0">{plT.backToDashboard}</Button>
         </Card>
       </div>
     );
  }

  return (
    <div className="min-h-screen p-6 bg-background flex flex-col items-center relative">
       <div className="absolute top-4 right-4 z-50">
          <AudioToggle isPlaying={isPlaying} onToggle={toggleMusic} />
        </div>

       <div className="max-w-2xl w-full mt-10 space-y-8 animate-in slide-in-from-bottom-5 duration-500">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl border shadow-sm">
            <p className="text-sm font-bold text-primary uppercase tracking-widest pl-2">{plT.questionLabel} {currentIndex + 1} de {questions.length}</p>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className={`text-2xl font-black px-4 py-1 rounded-xl transition-all ${timeLeft <= 3 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-primary/5 text-primary'}`}>
                  {timeLeft}s
                </div>
              )}
              <p className="text-sm font-black bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-md">{score} pts</p>
            </div>
          </div>

          <Card className="border-none shadow-2xl bg-card rounded-3xl">
            <CardHeader className="py-12 text-center">
              <h2 className="text-3xl md:text-5xl font-black leading-tight text-balance">{questions[currentIndex]?.questionText}</h2>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {questions[currentIndex]?.options?.map((opt: any) => (
                <Button 
                   key={opt.id} 
                   variant="outline" 
                   disabled={hasAnswered}
                   onClick={() => handleAnswer(opt.id)}
                   className={`h-auto min-h-[6.5rem] py-4 px-6 text-xl font-bold border-2 transition-all shadow-md whitespace-normal break-words rounded-2xl ${hasAnswered ? 'opacity-50 grayscale' : 'hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 shadow-lg shadow-black/5 hover:shadow-primary/20'}`}
                >
                  <span className="w-full text-center leading-tight">{opt.text}</span>
                </Button>
             ))}
          </div>

          {hasAnswered && (
             <p className="text-center font-bold text-muted-foreground animate-pulse text-lg py-4">
               {plT.answerSubmitted}
             </p>
          )}
       </div>
    </div>
  );
}
