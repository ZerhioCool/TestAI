import { db } from "@/db";
import { quizzesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, UserRound } from "lucide-react";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ pin?: string; error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const prefilledPin = resolvedParams.pin || "";
  const errorMessage = resolvedParams.error || "";

  async function handleJoinSession(formData: FormData) {
    "use server";
    const pin = formData.get("pin")?.toString().trim();
    const guestName = formData.get("guestName")?.toString().trim();

    if (!pin || !guestName) {
      redirect(`/join?error=Por favor llena todos los campos&pin=${pin}`);
    }

    // Buscar el quiz por el shareToken (PIN numérico)
    const activeQuiz = await db.select().from(quizzesTable).where(eq(quizzesTable.pinCode, pin)).limit(1);

    if (activeQuiz.length === 0) {
      redirect("/join?error=Ese PIN de sala no existe o el Quiz fue eliminado.");
    }

    // TODO: Comprobar límite de jugadores si el pase es de $0.99 (maxGuestPlayers).
    // Por ahora redirigir al juego con los datos del perfil local.
    const quizId = activeQuiz[0].id;
    
    // Para el modo multijugador en vivo, los mandamos a la sala de espera /live
    redirect(`/quiz/${quizId}/live?guest=${encodeURIComponent(guestName)}`);
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] bg-muted/20 px-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/10 relative overflow-hidden">
        {/* Decoración Superior */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500" />
        
        <CardHeader className="text-center pt-10 pb-6">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Únete al Quiz</CardTitle>
          <CardDescription className="text-base mt-2">Ingresa el PIN numérico de la sala para competir en vivo.</CardDescription>
        </CardHeader>
        
        <CardContent>
          {errorMessage && (
            <div className="mb-6 p-3 bg-destructive/15 border border-destructive/30 text-destructive text-sm font-medium rounded-lg text-center animate-pulse">
              {errorMessage}
            </div>
          )}

          <form action={handleJoinSession} className="space-y-5">
            <div className="space-y-4">
               {/* Input PIN numérico grande y centrado */}
              <div className="relative">
                <Input 
                  name="pin"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 84931" 
                  defaultValue={prefilledPin}
                  className="pl-12 h-16 text-center text-3xl font-mono tracking-[0.5em] focus:tracking-[0.5em] font-bold"
                  required
                  maxLength={5}
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6" />
              </div>

              {/* Input de Nombre corto */}
              <div className="relative">
                <Input 
                  name="guestName"
                  type="text"
                  placeholder="Escribe tu Nombre" 
                  className="pl-12 h-14 text-lg font-medium"
                  required
                  maxLength={20}
                />
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6" />
              </div>
            </div>
            
            <Button type="submit" className="w-full h-14 text-xl font-bold bg-primary hover:bg-primary/90 mt-4 active:scale-95 transition-transform duration-100 shadow-md shadow-primary/30">
              Entrar a la Sala
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
