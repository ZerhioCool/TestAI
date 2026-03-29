"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { Menu, X, Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const navTranslations = t('nav');
  
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const navLinks = [
    { href: "/#features", label: language === 'es' ? "Características" : "Features" },
    { href: "/library", label: navTranslations.library },
    { href: "/planes", label: navTranslations.pricing },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
          {mounted && user && (
            <Link href="/dashboard" className="transition-colors hover:text-primary">
              {navTranslations.dashboard}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Switcher - Hidden on very small screens to avoid crowding, but usually fine */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleLanguage}
            className="rounded-full font-black hover:bg-primary/10 transition-all border-primary/20 hover:border-primary/50 px-3 min-w-[40px]"
          >
            <span className="uppercase text-xs">{language === 'es' ? 'ES' : 'EN'}</span>
          </Button>

          <div className="hidden md:flex items-center gap-4">
            {mounted && user ? (
              <>
                <span className="hidden lg:inline-flex text-sm text-muted-foreground">
                  {user.email?.split('@')[0]}
                </span>
                <Button 
                  variant="ghost" 
                  className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/login";
                  }}
                >
                  {navTranslations.logout}
                </Button>
              </>
            ) : mounted ? (
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "rounded-full font-bold")}>
                {navTranslations.login}
              </Link>
            ) : (
              <div className="w-20 h-8 opacity-0" />
            )}
          </div>
          
          <Link 
            href="/upload" 
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 font-bold px-6"
            )}
          >
            {language === 'es' ? "Crear Quiz" : "Create Quiz"}
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background animate-in slide-in-from-top-4 duration-200">
          <nav className="container mx-auto flex flex-col p-4 gap-4 text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="py-2 transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Language Switcher in Mobile Menu */}
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-2 px-1 uppercase tracking-widest">{language === 'es' ? 'Cambiar Idioma' : 'Change Language'}</p>
              <div className="flex gap-2 text-base">
                <Button 
                  variant={language === 'es' ? 'default' : 'outline'} 
                  size="sm" 
                  className="rounded-xl flex-1 font-bold"
                  onClick={() => { setLanguage('es'); setIsMenuOpen(false); }}
                >
                  Español
                </Button>
                <Button 
                  variant={language === 'en' ? 'default' : 'outline'} 
                  size="sm" 
                  className="rounded-xl flex-1 font-bold"
                  onClick={() => { setLanguage('en'); setIsMenuOpen(false); }}
                >
                  English
                </Button>
              </div>
            </div>

            {mounted && user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="py-2 transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {navTranslations.dashboard}
                </Link>
                <div className="border-t pt-4 flex flex-col gap-4">
                  <div className="text-muted-foreground px-1">{user.email}</div>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start rounded-xl"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = "/login";
                    }}
                  >
                    {navTranslations.logout}
                  </Button>
                </div>
              </>
            ) : mounted ? (
              <Link 
                href="/login" 
                className="py-4 text-primary font-bold border-t mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {navTranslations.login}
              </Link>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}
