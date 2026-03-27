"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Share2, RotateCcw, Home } from "lucide-react";

export default function ResultsPage() {
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedScore = localStorage.getItem("quiz_score");
    const savedMax = localStorage.getItem("quiz_max_score");
    if (savedScore) setScore(parseInt(savedScore, 10));
    if (savedMax) setMaxScore(parseInt(savedMax, 10));
  }, []);

  if (!mounted) return null;

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  let message = "Sigue practicando";
  let color = "text-amber-500";
  if (percentage >= 70) {
    message = "¡Excelente Trabajo!";
    color = "text-success";
  } else if (percentage >= 40) {
    message = "¡Bien hecho!";
    color = "text-primary";
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
      <Card className="w-full shadow-2xl border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden animate-in zoom-in-95 duration-700">
        
        {/* Confetti or decorative header replacement */}
        <div className="h-32 bg-primary/10 w-full flex items-end justify-center pb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="h-24 w-24 bg-background rounded-full flex items-center justify-center shadow-xl border-4 border-background z-10 translate-y-12">
            <Trophy className={`h-12 w-12 ${color}`} />
          </div>
        </div>

        <CardContent className="pt-20 pb-12 flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight">{message}</h1>
          
          <div className="space-y-2">
            <p className="text-6xl font-black tabular-nums tracking-tighter text-balance">
              {score} <span className="text-2xl text-muted-foreground font-medium">/ {maxScore}</span>
            </p>
            <p className="text-muted-foreground font-medium text-lg">Puntos Finales ({percentage}%)</p>
          </div>

          <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
            <Button size="lg" className="w-full text-md" onClick={() => window.location.href = "/upload"}>
              <RotateCcw className="mr-2 w-5 h-5" />
              Crear Nuevo Quiz
            </Button>
            <Button size="lg" variant="outline" className="w-full text-md bg-transparent">
              <Share2 className="mr-2 w-5 h-5" />
              Compartir Resultado
            </Button>
          </div>
          
          <Link href="/" className="pt-4 text-sm text-muted-foreground hover:text-primary inline-flex items-center transition-colors">
            <Home className="mr-2 w-4 h-4" />
            Volver al Inicio
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
