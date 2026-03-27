"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Play, Loader2, Crown, Trophy, Volume2 } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useAudio } from "@/hooks/use-audio";
import { AudioToggle } from "@/components/shared/AudioToggle";
import confetti from "canvas-confetti";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminLivePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const { isPlaying, toggleMusic, playOneShot } = useAudio();
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = waiting, 0+ = question
  const [leaderboard, setLeaderboard] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(10);
  const [answersThisRound, setAnswersThisRound] = useState(0);
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join?pin=${quiz?.pinCode || ""}`);
    }
  }, [quiz?.pinCode]);

  useEffect(() => {
    async function initSession() {
      // 1. Cargar info del Quiz
      const qRes = await fetch(`/api/quiz/${resolvedParams.id}`);
      const qData = await qRes.json();
      if (qData.quiz) setQuiz(qData.quiz);
      if (qData.questions) setQuestions(qData.questions);

      // 2. Crear o recuperar sesión live
      const res = await fetch(`/api/quiz/${resolvedParams.id}/live/init`, { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setSession(data.session);
        setLoading(false);
        
        // 3. Suscribirse a Realtime
        const channel = supabase.channel(`live-session-broadcast-${resolvedParams.id}`)
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const presences = Object.values(state).flat();
            setPlayers(presences);
          })
          .on('broadcast', { event: 'answer-submitted' }, (payload: any) => {
            setLeaderboard(prev => ({
              ...prev,
              [payload.payload.name]: payload.payload.score
            }));
            setAnswersThisRound(prev => prev + 1);
          })
          .subscribe(async (status: any) => {
            if (status === 'SUBSCRIBED') {
              console.log("Admin listening on broadcast for quiz", resolvedParams.id);
            }
          });
        
        channelRef.current = channel;
      }
    }
    initSession();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [resolvedParams.id]); // Removed supabase from deps

  useEffect(() => {
    if (players.length > 0 && answersThisRound >= players.length && timeLeft > 0) {
      setTimeLeft(0);
    } else if (currentIndex >= 0 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (currentIndex >= 0 && timeLeft === 0) {
      handleNextQuestion();
    }
  }, [timeLeft, currentIndex, answersThisRound, players.length]);

  const handleStartGame = async () => {
    if (!channelRef.current) return;
    setCurrentIndex(0);
    setTimeLeft(10);
    setAnswersThisRound(0);
    await channelRef.current.send({
      type: 'broadcast',
      event: 'game-start',
      payload: { index: 0, timeLimit: 10 }
    });
    await fetch(`/api/quiz/${resolvedParams.id}/live/start`, { method: 'POST' });
  };

  const handleNextQuestion = async () => {
    if (!channelRef.current) return;
    const nextIdx = currentIndex + 1;
    if (nextIdx < questions.length) {
      setCurrentIndex(nextIdx);
      setTimeLeft(10);
      setAnswersThisRound(0);
      await channelRef.current.send({
        type: 'broadcast',
        event: 'next-question',
        payload: { index: nextIdx, timeLimit: 10 }
      });
    } else {
      setCurrentIndex(-2); // End of game
      setTimeLeft(0);
      await channelRef.current.send({
        type: 'broadcast',
        event: 'game-end',
        payload: {}
      });
      
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFFFFF', '#6366f1']
      });
      playOneShot("finish");
      
      // Save the session permanently
      try {
        await fetch(`/api/quiz/${resolvedParams.id}/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startedAt: new Date().toISOString(), 
            playersCount: players.length,
            leaderboard: leaderboard,
          })
        });
      } catch (e) {
        console.error("Error saving session", e);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-xl font-bold">Iniciando Sala de Control...</p>
        </div>
      </div>
    );
  }

  const renderLeaderboard = (title = "Ranking en Tiempo Real") => (
    <div className="mt-8 pt-6 border-t font-semibold space-y-4 text-left">
      <p className="flex items-center gap-2 justify-center md:justify-start">
        <Trophy className="h-5 w-5 text-yellow-500" /> {title}
      </p>
      <div className="space-y-2">
        {Object.entries(leaderboard)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, score], i) => (
            <div key={name} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg animate-in slide-in-from-right-2" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-sm font-black flex items-center justify-center">{i + 1}</span>
                <span className="text-lg">{name}</span>
              </span>
              <span className="font-bold text-lg">{score} pts</span>
            </div>
          ))}
        {Object.keys(leaderboard).length === 0 && <p className="text-sm font-normal text-muted-foreground italic text-center md:text-left">No hay puntuaciones aún...</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <Crown className="text-primary h-10 w-10" /> Panel de Control en Vivo
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground text-lg">Los jugadores se están uniendo...</p>
              <AudioToggle isPlaying={isPlaying} onToggle={toggleMusic} />
            </div>
          </div>
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-lg text-center">
            <p className="text-xs font-bold uppercase opacity-80">PIN DE ACCESO</p>
            <p className="text-4xl font-black font-mono">{quiz?.pinCode || "---"}</p>
          </div>
        </div>

        <div className="flex flex-col-reverse md:grid md:grid-cols-3 gap-8">
          <Card className="col-span-2 shadow-xl border-none bg-background">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                {currentIndex === -1 ? <Users className="h-5 w-5 text-primary" /> : <Play className="h-5 w-5 text-success" />}
                {currentIndex === -1 ? `Jugadores Conectados (${players.length})` : 
                 currentIndex === -2 ? "Juego Terminado" : `Pregunta ${currentIndex + 1} en curso`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {currentIndex === -1 ? (
                players.length === 0 ? (
                  <div className="py-10 text-center space-y-6 opacity-80 animate-in fade-in zoom-in duration-500">
                    <div className="bg-white p-4 rounded-2xl shadow-xl inline-block border-4 border-primary/20">
                      <QRCodeCanvas 
                        value={joinUrl} 
                        size={220}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: "/TestAI logo.png",
                          x: undefined,
                          y: undefined,
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-primary">Escanea el código para unirte</p>
                      <p className="text-sm text-muted-foreground">O entra en {joinUrl.split('?')[0]}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="font-medium">Esperando jugadores...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4 py-6">
                    {players.map((p, i) => (
                      <div 
                        key={i} 
                        className="bg-primary/10 text-primary border-2 border-primary/20 px-6 py-3 rounded-2xl font-black text-lg animate-in zoom-in-50 duration-300 shadow-sm flex items-center gap-2"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        {p.name || "Invitado"}
                      </div>
                    ))}
                  </div>
                )
              ) : currentIndex === -2 ? (
                <div className="py-12 text-center space-y-4">
                  <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
                  <h2 className="text-4xl font-black">¡Fin del Quiz!</h2>
                  <p className="text-lg text-muted-foreground mb-8">Observa quién ha sido el campeón de la clase.</p>
                  
                  <div className="max-w-md mx-auto bg-background rounded-2xl shadow-sm border p-6 mt-6">
                    {renderLeaderboard("Podio Final de Ganadores")}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="bg-primary/5 p-8 rounded-2xl border-2 border-primary/10 text-center relative">
                     <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground font-black rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-xl shadow-primary/20 ring-4 ring-background">
                        {timeLeft}
                     </div>
                     <h2 className="text-3xl font-black">{questions[currentIndex]?.questionText}</h2>
                   </div>
                   <div className="grid grid-cols-2 gap-4 opacity-60">
                     {questions[currentIndex]?.options?.map((o: any) => (
                       <div key={o.id} className="p-4 border rounded-xl">{o.text}</div>
                     ))}
                   </div>

                   {renderLeaderboard()}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-lg border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>
                  {currentIndex === -1 ? "¿Listos para empezar?" : 
                   currentIndex === -2 ? "Resultados" : "Control"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentIndex === -1 ? (
                  <Button 
                    onClick={handleStartGame}
                    disabled={players.length === 0}
                    className="w-full h-20 text-2xl font-black shadow-xl active:scale-95 transition-transform"
                  >
                    <Play className="mr-2 fill-current" /> EMPEZAR JUEGO
                  </Button>
                ) : currentIndex === -2 ? (
                  <Button onClick={() => router.push('/')} className="w-full h-14">Volver al Inicio</Button>
                ) : (
                  <Button 
                    onClick={handleNextQuestion}
                    className="w-full h-20 text-2xl font-black bg-success hover:bg-success/90"
                  >
                    {currentIndex + 1 < questions.length ? "PRÓXIMA PREGUNTA" : "FINALIZAR JUEGO"}
                  </Button>
                )}
                
                {currentIndex === -1 && (
                  <p className="text-xs text-center mt-4 text-muted-foreground italic">
                    Una vez iniciado, nadie más podrá unirse.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
