"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, FileText, Gamepad2, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        {/* Background gradient effects */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium transition-colors hover:bg-muted">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            TestAI v1.0 MVP ya disponible
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-balance">
            Tus apuntes se convierten en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">juegos</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground md:text-2xl text-balance">
            Sube un PDF, foto o texto y nuestra IA multimodal creará automáticamente un cuestionario gamificado en segundos. 
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/upload" 
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "rounded-full h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-105"
              )}
            >
              <Upload className="mr-2 h-5 w-5" />
              Subir PDF Gratis
            </Link>
            <Link href="/join">
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg shadow-sm font-bold border-2">
                <Gamepad2 className="mr-2 h-5 w-5" />
                Jugar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Magia en tres pasos</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Estudiar ya no tiene por qué ser aburrido. Gamifica tu aprendizaje con cero esfuerzo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileText className="h-10 w-10 text-primary" />}
              title="1. Sube tu material"
              description="Aceptamos PDFs, imágenes y texto plano. Nuestra IA soporta hasta documentos complejos."
            />
            <FeatureCard 
              icon={<BrainCircuit className="h-10 w-10 text-purple-600" />}
              title="2. La IA hace su magia"
              description="Analizamos el texto y las imágenes para generar preguntas de alta calidad con distractores inteligentes."
            />
            <FeatureCard 
              icon={<Gamepad2 className="h-10 w-10 text-success" />}
              title="3. ¡A jugar!"
              description="Juega solo o comparte el enlace con tus amigos y alumnos en un entorno gamificado con tiempo y puntos."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-md bg-background/60 backdrop-blur hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-8 space-y-4 flex flex-col items-center text-center">
        <div className="p-4 bg-muted rounded-2xl">
          {icon}
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
