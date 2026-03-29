"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, translations, TranslationKeys } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <T extends keyof TranslationKeys>(section: T) => TranslationKeys[T];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es'); // Default to 'es' initially to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage first
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'es')) {
      setLanguageState(savedLang);
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("es")) {
        setLanguageState("es");
      } else {
        setLanguageState("en");
      }
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = <T extends keyof TranslationKeys>(section: T): TranslationKeys[T] => {
    return translations[language][section];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
