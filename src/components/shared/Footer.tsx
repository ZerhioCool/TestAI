"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const fT = t('footer');

  return (
    <footer className="w-full border-t bg-muted/40 py-8 text-muted-foreground mt-auto">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <p className="text-sm font-medium italic">
            &copy; {new Date().getFullYear()} {fT.copyright}
          </p>
          <p className="text-[10px] font-black opacity-20 hover:opacity-100 transition-opacity">v1.2-G3-FORCE</p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/terminos" className="transition-colors hover:text-primary font-bold">
            {fT.terms}
          </Link>
          <Link href="/privacidad" className="transition-colors hover:text-primary font-bold">
            {fT.privacy}
          </Link>
          <Link href="/contacto" className="transition-colors hover:text-primary font-bold">
            {fT.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}
