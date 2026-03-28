import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-20 px-4 max-w-4xl min-h-screen">
      <Link href="/">
        <Button variant="ghost" className="mb-8 gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver al Inicio
        </Button>
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black">Política de Privacidad</h1>
          <p className="text-muted-foreground font-medium italic">Última actualización: 28 de marzo de 2026</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">1. Recopilación de Información</h2>
          <p>
            Recopilamos información básica para que TestAI funcione: correo electrónico para tu cuenta, nombre para personalizar tu perfil y cookies para mantener tu sesión activa.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">2. Tus Documentos y Datos</h2>
          <p>
            Los documentos que subes (PDFs, imágenes) se procesan temporalmente para generar el contenido del quiz. Estos archivos se almacenan de forma privada y solo tú tienes acceso a ellos.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>No vendemos tus datos a terceros.</li>
            <li>No compartimos tu contenido privado sin tu permiso.</li>
            <li>Puedes eliminar tu cuenta y datos en cualquier momento.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">3. Proveedores de Servicios</h2>
          <p>
            Utilizamos servicios externos como Google Gemini (IA), Supabase (Base de datos) y Stripe (Pagos) para ofrecer la plataforma. Cada uno cumple con altos estándares de seguridad y privacidad.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">4. Seguridad</h2>
          <p>
            Implementamos medidas técnicas para proteger tus datos contra accesos no autorizados. Utilizamos encriptación de extremo a extremo para las transacciones.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">5. Tus Derechos</h2>
          <p>
            Tienes derecho a acceder, rectificar o eliminar tus datos personales. Puedes contactarnos para ejercer estos derechos.
          </p>
        </section>
      </div>

      <div className="mt-16 p-8 bg-muted/30 rounded-3xl border text-center">
        <p className="font-bold text-muted-foreground">Tu privacidad es nuestra prioridad.</p>
        <Link href="/contacto">
          <Button variant="link" className="text-primary font-black mt-2">
            Ver detalles de contacto
          </Button>
        </Link>
      </div>
    </div>
  );
}
