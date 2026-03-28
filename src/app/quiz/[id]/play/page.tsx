"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Question = {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctAnswer: string[];
  explanation: string;
};

export default function PlayQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { language, t } = useLanguage();
  const plT = t('player');
  const commonT = t('common');
  
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const guestName = searchParams.get("guest") || (language === 'es' ? "Jugador" : "Player");

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

  useEffect(() => {
    if (isFinished || isChecking || timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, isChecking]);

  useEffect(() => {
    if (timeLeft === 0 && !isChecking && !isFinished) {
      handleSelectOption("");
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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return <div className="text-center p-12 font-bold text-xl">{plT.notFound}</div>;
  }

  if (isFinished) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="text-center py-10 border-4 border-primary/20 shadow-2xl bg-gradient-to-b from-background to-primary/5 rounded-[3rem] overflow-hidden">
          <CardHeader>
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 drop-shadow-lg animate-bounce" />
            <CardTitle className="text-5xl font-black">{plT.completed}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-2xl text-muted-foreground font-medium">{plT.wellDone}, <span className="font-black text-primary">{guestName}</span></p>
            <div className="text-7xl font-black text-primary drop-shadow-sm">
              {score} <span className="text-2xl text-muted-foreground uppercase tracking-widest italic">pts</span>
            </div>
            <p className="text-xl font-bold">
              {plT.statsCorrect} {score / 100} {plT.statsTotal} {questions.length} {plT.statsQuestions}.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="mt-8 h-16 px-12 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 transition-transform active:scale-95" size="lg">
              {plT.backToDashboard}
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
        <h2 className="text-3xl font-black text-destructive">{plT.errorQuestion}</h2>
        <p className="mt-6 text-xl text-muted-foreground font-medium">{plT.errorAI}</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-10 h-14 rounded-xl font-black px-8">
           {plT.backToDashboard}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl min-h-[80vh] flex flex-col justify-center animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end mb-10">
        <div className="flex flex-col space-y-1">
          <div className="text-muted-foreground font-black text-xs uppercase tracking-[0.3em] italic">
            {plT.questionLabel} {currentIndex + 1} / {questions.length}
          </div>
          {timeLeft !== null && (
            <div className={cn(
              "text-5xl font-black tabular-nums transition-colors duration-300",
              timeLeft <= 5 ? "text-destructive animate-pulse" : "text-primary"
            )}>
              {timeLeft}s
            </div>
          )}
        </div>
        <div className="bg-primary/10 text-primary px-8 py-3 rounded-[1.5rem] font-black shadow-inner border-2 border-primary/20 text-2xl">
          {score} <span className="text-sm uppercase italic opacity-70">pts</span>
        </div>
      </div>

      <Card className="border-4 shadow-xl mb-10 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="py-12 px-8">
          <CardTitle className="text-3xl md:text-4xl text-center font-black leading-tight text-balance">
            {currentQ.questionText}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {currentQ?.options?.map((opt) => {
          const isSelected = selectedOption === opt.id;
          const isCorrect = Array.isArray(currentQ?.correctAnswer)
            ? currentQ.correctAnswer.includes(opt.id)
            : String(currentQ?.correctAnswer) === String(opt.id);
          
          let btnClass = "border-4 text-left h-auto py-8 px-8 text-xl justify-start items-center flex gap-5 transition-all rounded-[1.8rem] ";
          
          if (!isChecking) {
            btnClass += "hover:border-primary hover:bg-primary/5 hover:scale-[1.02] shadow-md hover:shadow-xl active:scale-[0.98]";
          } else {
            if (isCorrect) {
              btnClass += "border-success bg-success/10 text-success-foreground shadow-lg shadow-success/10";
            } else if (isSelected && !isCorrect) {
              btnClass += "border-destructive bg-destructive/10 text-destructive-foreground opacity-90 scale-[0.98] shadow-inner";
            } else {
              btnClass += "opacity-40 grayscale";
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
               <span className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 font-black text-sm border-2">
                 {opt.id}
               </span>
               <span className="break-words whitespace-normal leading-snug font-bold">{opt.text}</span>
               
               {isChecking && isCorrect && <CheckCircle2 className="ml-auto w-8 h-8 text-success shrink-0" />}
               {isChecking && isSelected && !isCorrect && <XCircle className="ml-auto w-8 h-8 text-destructive shrink-0" />}
            </Button>
          );
        })}
      </div>

      {isChecking && currentQ.explanation && (
        <div className="mt-12 p-8 bg-muted/40 rounded-[2rem] border-2 border-dashed border-primary/20 animate-in slide-in-from-bottom-6 duration-700">
          <h4 className="font-black text-lg flex items-center gap-3 mb-3 text-primary uppercase tracking-widest text-sm italic">
             ✨ {plT.explanation}
          </h4>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed">{currentQ.explanation}</p>
        </div>
      )}

    </div>
  );
}
