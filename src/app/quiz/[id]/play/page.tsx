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
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExamMode, setIsExamMode] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch(`/api/quiz/${resolvedParams.id}`);
        if (!res.ok) throw new Error("Failed to load quiz");
        const data = await res.json();
        setQuiz(data.quiz);
        setQuestions(data.questions);
        setTimeLeft(Math.max(data.quiz.timeLimitSec || 30, 15));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [resolvedParams.id]);

  useEffect(() => {
    // Solo descontar tiempo en Modo Examen (y si hay límite definido)
    if (isFinished || isChecking || timeLeft === null || timeLeft <= 0 || !isExamMode) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, isChecking, isExamMode]);

  useEffect(() => {
    if (timeLeft === 0 && !isChecking && !isFinished) {
      handleSelectOption("");
    }
  }, [timeLeft, isChecking, isFinished]);

  const handleSelectOption = (optionId: string) => {
    if (isChecking || hasAnswered) return;
    setSelectedOption(optionId);
    setIsChecking(true);
    setHasAnswered(true);

    const currentAnswer = questions[currentIndex]?.correctAnswer;
    const isCorrect = Array.isArray(currentAnswer) 
      ? currentAnswer.includes(optionId) 
      : String(currentAnswer) === String(optionId);
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    // En Modo Examen avanzado automático después de 2 segundos
    if (isExamMode) {
      setTimeout(() => {
        handleNextQuestion();
      }, 2000);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsChecking(false);
      setHasAnswered(false);
      setTimeLeft(Math.max(quiz?.timeLimitSec || 30, 15));
    } else {
      setIsFinished(true);
    }
  };

  const currentScorePercentage = questions.length > 0 
    ? Math.round((correctCount / questions.length) * 100) 
    : 0;

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
          <CardContent className="space-y-8 px-4 md:px-12 text-foreground">
            <p className="text-2xl text-muted-foreground font-medium">{plT.wellDone}, <span className="font-black text-primary">{guestName}</span></p>
            <div className="text-7xl font-black text-primary drop-shadow-sm">
              {currentScorePercentage}<span className="text-4xl">%</span>
            </div>
            <p className="text-xl font-bold">
              {plT.statsCorrect} {correctCount} {plT.statsTotal} {questions.length} {plT.statsQuestions}.
            </p>

            <div className="pt-8 space-y-6 text-left">
               <h3 className="text-2xl font-black flex items-center gap-3 italic">
                 📖 {language === 'es' ? "Revisión de Respuestas" : "Answer Review"}
               </h3>
               {questions.map((q, idx) => (
                 <div key={q.id} className="p-6 bg-background rounded-3xl border-2 shadow-sm space-y-4">
                    <p className="font-black text-lg">
                      <span className="text-primary mr-2">#{idx+1}</span> {q.questionText}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map(opt => {
                        const isCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(opt.id) : q.correctAnswer === opt.id;
                        return (
                          <span key={opt.id} className={cn(
                            "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border-2",
                            isCorrect ? "bg-success/10 border-success text-success" : "bg-muted border-transparent text-muted-foreground opacity-60"
                          )}>
                            {opt.id}: {opt.text}
                          </span>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="p-4 bg-primary/5 rounded-2xl text-sm italic font-medium border-l-4 border-primary">
                        <span className="font-black uppercase text-[10px] text-primary block mb-1">Explainer:</span>
                        {q.explanation}
                      </div>
                    )}
                 </div>
               ))}
            </div>

            <Button onClick={() => router.push("/dashboard")} className="mt-8 h-16 px-12 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:translate-y-[-4px] active:scale-95" size="lg">
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
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-6xl min-h-screen flex flex-col animate-in fade-in duration-500">
      
      {/* Header Estilo Imagen */}
      <div className="flex justify-between items-center mb-8 border-b-2 pb-4">
        <div className="text-xl md:text-2xl font-black">
          Score <span className="text-primary">{currentScorePercentage}%</span>
        </div>
        <div className="flex flex-col items-center">
          {isExamMode && timeLeft !== null && (
            <div className={cn(
              "text-3xl font-black tabular-nums transition-colors duration-300",
              timeLeft <= 5 ? "text-destructive animate-pulse" : "text-primary"
            )}>
              {timeLeft}s
            </div>
          )}
        </div>
        <div className="text-xl md:text-2xl font-black flex items-center gap-2">
          {plT.questionLabel} <span className="text-primary">{currentIndex + 1}/{questions.length}</span>
        </div>
      </div>
 
      {/* Main Layout: Split Screen */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-12">
        
        {/* Lado Izquierdo: Pregunta y Explicación */}
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-700">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl md:text-4xl font-black leading-tight text-balance">
                {currentQ.questionText}
              </CardTitle>
            </CardHeader>
          </Card>
 
          {isChecking && currentQ.explanation && !isExamMode && (
            <div className="p-6 md:p-8 bg-amber-50/50 rounded-3xl border-2 border-amber-200/50 shadow-sm animate-in zoom-in-95 duration-500">
              <h4 className="font-black text-lg flex items-center gap-3 mb-4 text-amber-700 uppercase tracking-widest text-sm italic">
                 💡 {plT.explanation}
              </h4>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}
        </div>
 
        {/* Lado Derecho: Opciones */}
        <div className="grid grid-cols-1 gap-4">
          {currentQ?.options?.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrect = Array.isArray(currentQ?.correctAnswer)
              ? currentQ.correctAnswer.includes(opt.id)
              : String(currentQ?.correctAnswer) === String(opt.id);
            
            let btnClass = "border-2 text-left h-auto py-5 px-6 md:py-6 md:px-8 text-lg font-bold justify-start items-center flex gap-4 md:gap-5 transition-all rounded-2xl ";
            
            if (!hasAnswered) {
              btnClass += "hover:border-primary hover:bg-primary/5 hover:translate-x-1 shadow-sm active:scale-[0.98]";
            } else {
              if (isCorrect) {
                btnClass += "border-success bg-success/10 text-success-foreground shadow-md ring-2 ring-success/20";
              } else if (isSelected && !isCorrect) {
                btnClass += "border-destructive bg-destructive/10 text-destructive-foreground opacity-90 scale-[0.98]";
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
                disabled={hasAnswered}
              >
                 <span className={cn(
                   "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs border-2 transition-colors",
                   hasAnswered && isCorrect ? "bg-success text-white border-success" : "bg-muted text-muted-foreground"
                 )}>
                   {hasAnswered && isCorrect ? "✓" : opt.id}
                 </span>
                 <span className="break-words whitespace-normal leading-snug">{opt.text}</span>
                 
                 {hasAnswered && isCorrect && <CheckCircle2 className="ml-auto w-6 h-6 text-success shrink-0" />}
                 {hasAnswered && isSelected && !isCorrect && <XCircle className="ml-auto w-6 h-6 text-destructive shrink-0" />}
              </Button>
            );
          })}
        </div>
      </div>
 
      {/* Footer Actions */}
      <div className="mt-auto space-y-8 pb-8">
        {/* Botón Siguiente (Solo en Modo Estudio y tras responder) */}
        {!isExamMode && hasAnswered && (
          <div className="flex justify-center animate-in fade-in zoom-in duration-300">
            <Button 
              onClick={handleNextQuestion} 
              className="bg-[#c23b2b] hover:bg-[#a03023] text-white rounded-xl h-14 px-12 text-xl font-black shadow-xl shadow-red-900/20 transition-all hover:scale-105 active:scale-95"
            >
              Next &gt;
            </Button>
          </div>
        )}
 
        {/* Toggle Modo */}
        <div className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-muted-foreground">
          <span className={cn("transition-colors", !isExamMode ? "text-primary" : "")}>Study mode</span>
          <button 
            onClick={() => {
               if(!hasAnswered) setIsExamMode(!isExamMode);
            }}
            disabled={hasAnswered}
            className={cn(
              "relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isExamMode ? "bg-primary" : "bg-slate-200",
              hasAnswered ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200",
                isExamMode ? "translate-x-8" : "translate-x-1"
              )}
            />
          </button>
          <span className={cn("transition-colors", isExamMode ? "text-primary" : "")}>Exam mode</span>
        </div>
      </div>
 
    </div>
  );
}
