import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="container mx-auto py-20 px-4 max-w-4xl min-h-screen">
      <Link href="/">
        <Button variant="ghost" className="mb-8 gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver al Inicio
        </Button>
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <ScrollText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black">Términos de Servicio</h1>
          <p className="text-muted-foreground font-medium italic">Última actualización: 28 de marzo de 2026</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar TestAI, aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no podrás utilizar nuestros servicios.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">2. Uso del Servicio</h2>
          <p>
            TestAI proporciona herramientas basadas en inteligencia artificial para generar cuestionarios a partir de documentos. Te comprometes a utilizar el servicio de manera legal y ética.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>No debes subir contenido que infrinja derechos de autor.</li>
            <li>No debes intentar vulnerar la seguridad de la plataforma.</li>
            <li>Eres responsable de la confidencialidad de tu cuenta.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">3. Planes y Pagos</h2>
          <p>
            Ofrecemos planes gratuitos y de pago (Pro, Pase Único). Los pagos se procesan de forma segura a través de Stripe. No se realizarán reembolsos por períodos ya utilizados a menos que la ley lo exija.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">4. Propiedad Intelectual</h2>
          <p>
            Tú conservas todos los derechos sobre el contenido que subes. TestAI conserva todos los derechos sobre la plataforma, algoritmos y diseño del servicio.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">5. Limitación de Responsabilidad</h2>
          <p>
            TestAI se proporciona "tal cual". No garantizamos que los resultados generados por la IA sean 100% precisos. Es responsabilidad del usuario verificar las preguntas antes de utilizarlas en entornos críticos.
          </p>
        </section>
      </div>

      <div className="mt-16 p-8 bg-muted/30 rounded-3xl border text-center">
        <p className="font-bold text-muted-foreground">¿Tienes dudas sobre nuestros términos?</p>
        <Link href="/contacto">
          <Button variant="link" className="text-primary font-black mt-2">
            Contáctanos aquí
          </Button>
        </Link>
      </div>
    </div>
  );
}
