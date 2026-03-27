"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";

export default function GenerateQuizPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, type: "bulk" }),
      });
      const data = await res.json();

      if (res.ok && data.questions) {
        // Save the generated quiz to the database
        const saveRes = await fetch("/api/quiz/save-bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: data.title, questions: data.questions }),
        });
        const saveData = await saveRes.json();
        if (saveRes.ok) {
          router.push(`/quiz/${saveData.quizId}/edit`);
        } else {
          alert("Error al guardar: " + saveData.error);
        }
      } else {
        alert("Error de IA: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error al conectar con la IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-20 px-4 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <Card className="border-2 shadow-xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-yellow-300" />
            <CardTitle className="text-3xl font-black">Generador Mágico</CardTitle>
          </div>
          <CardDescription className="text-purple-100 text-lg">
            Introduce un tema y la IA creará un quiz completo para ti en segundos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">¿Sobre qué quieres el quiz?</label>
              <Input 
                placeholder="Ej: Historia de la Antigua Roma, Física Cuántica, Capitales del Mundo..." 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                className="h-16 text-xl rounded-2xl border-2 focus:ring-purple-500 font-medium px-6"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !topic.trim()} 
              className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Generando Magia...
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-6 w-6" />
                  ¡Generar Quiz Ahora!
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="text-center mt-8 text-muted-foreground font-medium">
        💡 Intenta ser específico para obtener mejores resultados.
      </p>
    </div>
  );
}
