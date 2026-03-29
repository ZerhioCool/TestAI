"use client";

import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsPage() {
  const { t } = useLanguage();
  const termsTranslations = t('terms');
  const contactTranslations = t('contact');

  return (
    <div className="container mx-auto py-20 px-4 max-w-4xl min-h-screen">
      <Link href="/">
        <Button variant="ghost" className="mb-8 gap-2">
          <ArrowLeft className="h-4 w-4" /> {contactTranslations.back}
        </Button>
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <ScrollText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black">{termsTranslations.title}</h1>
          <p className="text-muted-foreground font-medium italic">{termsTranslations.lastUpdate}</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">{termsTranslations.section1Title}</h2>
          <p>{termsTranslations.section1Desc}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">{termsTranslations.section2Title}</h2>
          <p>{termsTranslations.section2Desc}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{termsTranslations.section2List1}</li>
            <li>{termsTranslations.section2List2}</li>
            <li>{termsTranslations.section2List3}</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">{termsTranslations.section3Title}</h2>
          <p>{termsTranslations.section3Desc}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">{termsTranslations.section4Title}</h2>
          <p>{termsTranslations.section4Desc}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">{termsTranslations.section5Title}</h2>
          <p>{termsTranslations.section5Desc}</p>
        </section>
      </div>

      <div className="mt-16 p-8 bg-muted/30 rounded-3xl border text-center">
        <p className="font-bold text-muted-foreground">{termsTranslations.footerNotice}</p>
        <Link href="/contacto">
          <Button variant="link" className="text-primary font-black mt-2">
            {termsTranslations.contactBtn}
          </Button>
        </Link>
      </div>
    </div>
  );
}
