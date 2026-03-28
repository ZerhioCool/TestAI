import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Twitter, Instagram, Linkedin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="container mx-auto py-20 px-4 max-w-5xl min-h-screen">
      <Link href="/">
        <Button variant="ghost" className="mb-8 gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver al Inicio
        </Button>
      </Link>

      <div className="text-center space-y-4 mb-16">
        <h1 className="text-5xl font-black tracking-tight">Estamos para ayudarte</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          ¿Tienes dudas sobre los planes, problemas técnicos o simplemente quieres saludarnos? Elige tu canal preferido.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="border-2 shadow-xl hover:border-primary/50 transition-all rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-primary/5 border-b pb-6">
            <Mail className="h-10 w-10 text-primary mb-4" />
            <CardTitle className="text-2xl font-black">Soporte por Correo</CardTitle>
            <CardDescription className="text-base">Ideal para consultas detalladas o problemas técnicos.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg font-bold text-primary mb-4">hola@testai.com</p>
            <Link href="mailto:hola@testai.com">
               <Button className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                 Enviar Email
               </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-xl hover:border-primary/50 transition-all rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-success/5 border-b pb-6">
            <MessageSquare className="h-10 w-10 text-success mb-4" />
            <CardTitle className="text-2xl font-black">Chat y Soporte Rápido</CardTitle>
            <CardDescription className="text-base">Síguenos en redes para actualizaciones y contacto rápido.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 border-none">
             <div className="flex gap-4 mb-6">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2"><Twitter className="h-6 w-6" /></Button>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2"><Instagram className="h-6 w-6" /></Button>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2"><Linkedin className="h-6 w-6" /></Button>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2"><Globe className="h-6 w-6" /></Button>
             </div>
             <p className="text-sm text-muted-foreground font-medium italic">Generalmente respondemos en menos de 24 horas.</p>
          </CardContent>
        </Card>
      </div>

      <div className="p-12 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-[3rem] border-2 border-primary/20 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
           <Mail className="h-32 w-32 rotate-12" />
        </div>
        <h2 className="text-3xl font-black mb-4 relative z-10">¿Interesado en el Plan Corporativo?</h2>
        <p className="text-lg mb-8 relative z-10 font-medium">Si necesitas integrar TestAI con tu institución, contáctanos hoy.</p>
        <Link href="mailto:corporativo@testai.com">
          <Button size="lg" className="rounded-2xl px-12 h-14 text-lg font-black bg-primary hover:bg-primary/90 transition-transform active:scale-95 shadow-2xl relative z-10">
            Hablemos de negocios
          </Button>
        </Link>
      </div>
    </div>
  );
}
