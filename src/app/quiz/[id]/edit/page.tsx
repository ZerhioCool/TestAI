"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft, Edit3, Sparkles } from "lucide-react";


export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      const res = await fetch(`/api/quiz/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data.quiz);
        setQuestions(data.questions);
        setIsPro(data.isPro);
      }
      setLoading(false);
    }
    loadQuiz();
  }, [resolvedParams.id]);

  const handleAiSuggest = async () => {
    if (!isPro && questions.length >= 10) {
      alert("Haz upgrade a Pro para generar más preguntas con IA.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: quiz?.title || "General",
          existingQuestionsCount: questions.length,
          suggestedCount: 3,
          type: "suggestion"
        }),
      });
      const data = await res.json();
      if (data && Array.isArray(data)) {
        // Asignar IDs temporales y orderIndex
        const newQuestions = data.map((q: any, i: number) => ({
          ...q,
          id: `ai-${Date.now()}-${i}`,
          quizId: resolvedParams.id,
          orderIndex: questions.length + i,
        }));
        setQuestions([...questions, ...newQuestions]);
      } else if (data.error) {
        alert("Error de IA: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error al conectar con la IA.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/quiz/${resolvedParams.id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });
      if (res.ok) {
        router.push(`/quiz/${resolvedParams.id}`);
      } else {
        alert("Error al guardar los cambios");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].text = text;
    setQuestions(updated);
  };

  const toggleCorrectAnswer = (qIndex: number, optId: string) => {
    const updated = [...questions];
    let config = updated[qIndex].correctAnswer;
    if (!Array.isArray(config)) config = [config];
    
    if (config.includes(optId)) {
      if (config.length > 1) {
        config = config.filter((id: string) => id !== optId);
      }
    } else {
      config = [...config, optId];
    }
    updated[qIndex].correctAnswer = config;
    setQuestions(updated);
  };

  const changeQuestionType = (qIndex: number, type: string) => {
    const updated = [...questions];
    updated[qIndex].type = type;
    if (type === "true_false") {
      updated[qIndex].options = [
        { id: "A", text: "Verdadero" },
        { id: "B", text: "Falso" }
      ];
      updated[qIndex].correctAnswer = ["A"];
    } else {
      if (updated[qIndex].options.length < 4) {
        updated[qIndex].options = [
          { id: "A", text: "Opción A" },
          { id: "B", text: "Opción B" },
          { id: "C", text: "Opción C" },
          { id: "D", text: "Opción D" }
        ];
      }
    }
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    if (!isPro && questions.length >= 10) {
      alert("Haz upgrade a Pro para agregar más de 10 preguntas.");
      return;
    }
    if (questions.length >= 20) {
      alert("Límite máximo de 20 preguntas alcanzado.");
      return;
    }
    setQuestions([...questions, {
      id: `new-${Date.now()}`,
      quizId: resolvedParams.id,
      orderIndex: questions.length,
      type: "multiple_choice",
      questionText: "Nueva Pregunta",
      options: [
        { id: "A", text: "Opción A" }, { id: "B", text: "Opción B" },
        { id: "C", text: "Opción C" }, { id: "D", text: "Opción D" }
      ],
      correctAnswer: ["A"],
      points: 100
    }]);
  };

  const handleDeleteQuestion = (qIndex: number) => {
    if (questions.length <= 1) {
      alert("No puedes eliminar la única pregunta.");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== qIndex));
  };

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center justify-center sm:justify-start gap-3"><Edit3 className="text-primary"/> Editor Manual</h1>
          <p className="text-muted-foreground mt-2">{quiz?.title}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(`/quiz/${resolvedParams.id}`)} className="shadow-sm">
             <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-success hover:bg-success/90 shadow-md border-success-foreground font-bold">
             {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Guardar
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, qIdx) => (
          <Card key={q.id} className="border-2 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/50 border-b pb-4">
               <CardTitle className="text-lg flex items-center justify-between text-primary font-black">
                 <span>Pregunta {qIdx + 1}</span>
                 <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => handleDeleteQuestion(qIdx)}>
                   Eliminar
                 </Button>
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-bold mb-2 block text-muted-foreground">Texto de la Pregunta</label>
                  <input 
                    value={q.questionText || ""} 
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)} 
                    className="flex h-auto min-h-[3rem] w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-lg font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="w-full md:w-48 shrink-0">
                  <label className="text-sm font-bold mb-2 block text-muted-foreground">Tipo</label>
                  <select 
                    value={q.type || "multiple_choice"}
                    onChange={(e) => changeQuestionType(qIdx, e.target.value)}
                    className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="multiple_choice">Opción Múltiple</option>
                    <option value="true_false">Verdadero o Falso</option>
                  </select>
                </div>
              </div>
              
              <div>
                 <label className="text-sm font-bold mb-3 block text-muted-foreground">
                   Alternativas (Marca las casillas correspondientes a las respuestas correctas)
                 </label>
                 <div className="grid grid-cols-1 gap-3">
                   {q.options?.map((opt: any, optIdx: number) => {
                     const isCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(opt.id) : q.correctAnswer === opt.id;
                     
                     return (
                       <div key={opt.id} className={`flex items-center gap-3 p-3 border-2 rounded-xl transition-colors ${isCorrect ? 'border-success bg-success/5 shadow-sm' : 'bg-background hover:bg-muted/30'}`}>
                         <input 
                           type="checkbox" 
                           checked={isCorrect}
                           onChange={() => toggleCorrectAnswer(qIdx, opt.id)}
                           className="w-6 h-6 accent-success shrink-0 cursor-pointer rounded-md"
                           title="Marcar como correcta"
                         />
                         <span className="font-black text-muted-foreground w-8 text-center bg-muted rounded-md py-1">{opt.id}</span>
                         <input 
                           value={opt.text} 
                           onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                           disabled={q.type === "true_false"}
                           className={`flex h-11 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-medium ${isCorrect ? 'border-success/30' : ''} ${q.type === "true_false" ? 'opacity-50 cursor-not-allowed font-bold text-foreground' : ''}`}
                         />
                       </div>
                     );
                   })}
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleAddQuestion} 
            className="w-full max-w-sm rounded-full border-2 shadow-sm font-bold h-14 bg-muted/50 hover:bg-primary/5 hover:border-primary/50 text-foreground"
          >
            ➕ Agregar Nueva Pregunta
          </Button>
          <Button 
            variant="default" 
            size="lg" 
            onClick={handleAiSuggest} 
            disabled={generating}
            className="w-full max-w-sm rounded-full border-2 shadow-md font-bold h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none"
          >
            {generating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5 text-yellow-300" />}
            {generating ? "Generando..." : "Sugerir con IA"}
          </Button>
        </div>
      </div>
    </div>
  );
}
