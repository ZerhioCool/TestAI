import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/40 py-8 text-muted-foreground mt-auto">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm font-medium">
          &copy; {new Date().getFullYear()} TestAI. Creado para evaluación interactiva.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Términos
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
