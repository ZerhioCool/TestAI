import Link from "next/link";
import { CheckCircle2, Crown, Zap } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { cn } from "@/lib/utils";

export default async function PlanesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto py-16 px-4 max-w-6xl min-h-[85vh] flex flex-col justify-center">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-balance">
          Desbloquea el poder de <span className="text-primary">TestAI</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Desde generar quizzes gratis hasta crear salas enormes interactuando con +50 alumnos. Elige tu plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Gratuito */}
        <Card className="flex flex-col shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Básico</CardTitle>
            <CardDescription>Para que pruebes la magia</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="text-muted-foreground">/siempre</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-5 w-5 text-primary" /> 1 Quiz al mes gratis</li>
              <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-5 w-5 text-primary" /> Hasta 3 páginas por PDF</li>
              <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-5 w-5 text-primary" /> Entrenar en solitario</li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground opacity-50"><CheckCircle2 className="h-5 w-5" /> Sin salas multijugador</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href={user ? "/dashboard" : "/register"} className="w-full">
              <Button variant="outline" className="w-full text-base h-12 rounded-xl">
                {user ? "Ir al Dashboard" : "Registrarse Gratis"}
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Pro */}
        <Card className="flex flex-col border-primary shadow-xl scale-105 relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-black px-3 py-1 rounded-bl-lg">
            MÁS POPULAR
          </div>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Crown className="h-6 w-6 text-primary" /> Plan Pro</CardTitle>
            <CardDescription>Ilimitado y potente</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-extrabold">$4.99</span>
              <span className="text-muted-foreground">/mes</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-primary" /> Quizzes generados ILIMITADOS</li>
              <li className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-primary" /> Soporte hasta 50 páginas por PDF</li>
              <li className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-primary" /> Salas Multijugador ILIMITADAS</li>
              <li className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-primary" /> Hasta 50 jugadores por sala</li>
            </ul>
          </CardContent>
          <CardFooter>
            {user ? (
              <form action="/api/checkout/pro" method="POST" className="w-full">
                <Button type="submit" className="w-full text-lg h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 rounded-2xl transition-transform active:scale-95">
                  Suscribirse a Pro
                </Button>
              </form>
            ) : (
              <Link href="/login?redirect=/planes" className="w-full">
                <Button className="w-full text-lg h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 rounded-2xl transition-transform active:scale-95">
                  Iniciar Sesión para Suscribirse
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>

        {/* Pase Único */}
        <Card className="flex flex-col shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" /> Pase de Uso Único</CardTitle>
            <CardDescription>Paga sólo por lo que necesitas</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-extrabold">$0.99</span>
              <span className="text-muted-foreground">/sala</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-5 w-5 text-primary" /> Desbloquea 1 Quiz específico</li>
              <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-5 w-5 text-primary" /> Modo Multijugador activo</li>
              <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-5 w-5 text-primary" /> Hasta 10 jugadores en la sala</li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-5 w-5" /> Dura para siempre en ese quiz</li>
            </ul>
          </CardContent>
          <CardFooter>
             <p className="text-xs text-muted-foreground text-center w-full">
               Este pase se adquiere directamente dentro del Lobby de cada Quiz.
             </p>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
