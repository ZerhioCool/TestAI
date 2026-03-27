"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/login/actions";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }: any) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <div className="relative h-10 overflow-hidden flex items-center justify-center">
              <img src="/TestAIlogoname.png" alt="TestAI Logo" className="object-contain h-full w-auto" />
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/#features" className="transition-colors hover:text-primary">
            Características
          </Link>
          <Link href="/library" className="transition-colors hover:text-primary">
            Explorar Biblioteca
          </Link>
          <Link href="/planes" className="transition-colors hover:text-primary">
            Planes
          </Link>
          {mounted && user && (
            <Link href="/dashboard" className="transition-colors hover:text-primary">
              Mi Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {mounted && user ? (
            <>
              <span className="hidden sm:inline-flex text-sm text-muted-foreground">
                {user.email?.split('@')[0]}
              </span>
              <Button 
                variant="ghost" 
                className="hidden sm:inline-flex rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
              >
                Cerrar Sesión
              </Button>
            </>
          ) : mounted ? (
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex rounded-full")}>
              Iniciar Sesión
            </Link>
          ) : (
            <div className="w-20 h-8 opacity-0" /> // Placeholder to prevent layout shift
          )}
          
          <Link 
            href="/upload" 
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
            )}
          >
            Crear Quiz
          </Link>
        </div>
      </div>
    </header>
  );
}
