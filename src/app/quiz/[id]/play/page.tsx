"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Trophy } from "lucide-react";

type Question = {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctAnswer: string[];
  explanation: string;
};

export default function PlayQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const guestName = searchParams.get("guest") || "Jugador";

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch(`/api/quiz/${resolvedParams.id}`);
        if (!res.ok) throw new Error("Failed to load quiz");
        const data = await res.json();
        setQuiz(data.quiz);
        setQuestions(data.questions);
        setTimeLeft(data.quiz.timeLimitSec || 30);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [resolvedParams.id]);

  // Timer logic
  useEffect(() => {
    if (isFinished || isChecking || timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, isChecking]);

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && !isChecking && !isFinished) {
      handleSelectOption(""); // Send empty to trigger "incorrect"
    }
  }, [timeLeft, isChecking, isFinished]);

  const handleSelectOption = (optionId: string) => {
    if (isChecking) return;
    setSelectedOption(optionId);
    setIsChecking(true);

    const currentAnswer = questions[currentIndex]?.correctAnswer;
    const isCorrect = Array.isArray(currentAnswer) 
      ? currentAnswer.includes(optionId) 
      : String(currentAnswer) === String(optionId);
    if (isCorrect) {
      setScore(prev => prev + 100);
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsChecking(false);
        setTimeLeft(quiz?.timeLimitSec || 30);
      } else {
        setIsFinished(true);
      }
    }, 2500);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return <div className="text-center p-12">No se encontró el quiz.</div>;
  }

  if (isFinished) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="text-center py-10 border-2 border-primary/20 shadow-xl bg-gradient-to-b from-background to-primary/5">
          <CardHeader>
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-4xl font-black">¡Completado!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xl text-muted-foreground">Bien hecho, <span className="font-bold text-primary">{guestName}</span></p>
            <div className="text-6xl font-black text-primary">
              {score} <span className="text-2xl text-muted-foreground">pts</span>
            </div>
            <p className="text-lg">
              Acertaste {score / 100} de {questions.length} preguntas.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="mt-8" size="lg">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  if (!currentQ) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error en la pregunta</h2>
        <p className="mt-4 text-muted-foreground">La pregunta {currentIndex + 1} está corrupta o incompleta originada por la IA.</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-8">Volver al Inicio</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl min-h-[80vh] flex flex-col justify-center">
      
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <div className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">
            Pregunta {currentIndex + 1} de {questions.length}
          </div>
          {timeLeft !== null && (
            <div className={cn(
              "text-2xl font-black mt-1",
              timeLeft <= 5 ? "text-destructive animate-pulse" : "text-primary"
            )}>
              {timeLeft}s
            </div>
          )}
        </div>
        <div className="bg-primary/10 text-primary px-6 py-2 rounded-2xl font-black shadow-sm border border-primary/20">
          {score} pts
        </div>
      </div>

      <Card className="border-2 shadow-sm mb-6">
        <CardHeader className="py-8">
          <CardTitle className="text-2xl md:text-3xl text-center leading-relaxed">
            {currentQ.questionText}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQ?.options?.map((opt) => {
          const isSelected = selectedOption === opt.id;
          const isCorrect = Array.isArray(currentQ?.correctAnswer)
            ? currentQ.correctAnswer.includes(opt.id)
            : String(currentQ?.correctAnswer) === String(opt.id);
          
          let btnClass = "border-2 text-left h-auto py-6 px-6 text-lg justify-start items-center flex gap-4 transition-all ";
          
          if (!isChecking) {
            btnClass += "hover:border-primary hover:bg-primary/5 active:scale-[0.98]";
          } else {
            if (isCorrect) {
              btnClass += "border-success bg-success/10 text-success-foreground";
            } else if (isSelected && !isCorrect) {
              btnClass += "border-destructive bg-destructive/10 text-destructive-foreground opacity-90 scale-[0.98]";
            } else {
              btnClass += "opacity-50 grayscale";
            }
          }

          return (
            <Button
              key={opt.id}
              variant="outline"
              className={btnClass}
              onClick={() => handleSelectOption(opt.id)}
              disabled={isChecking}
            >
               <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 font-bold">
                 {opt.id}
               </span>
               <span className="break-words whitespace-normal leading-tight">{opt.text}</span>
               
               {isChecking && isCorrect && <CheckCircle2 className="ml-auto w-6 h-6 text-success shrink-0" />}
               {isChecking && isSelected && !isCorrect && <XCircle className="ml-auto w-6 h-6 text-destructive shrink-0" />}
            </Button>
          );
        })}
      </div>

      {isChecking && currentQ.explanation && (
        <div className="mt-8 p-6 bg-muted/50 rounded-xl border animate-in fade-in slide-in-from-bottom-4">
          <h4 className="font-bold flex items-center gap-2 mb-2">Explicación</h4>
          <p className="text-muted-foreground">{currentQ.explanation}</p>
        </div>
      )}

    </div>
  );
}
