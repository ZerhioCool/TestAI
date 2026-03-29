"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();
  const privacyTranslations = t('privacy');
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
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black">{privacyTranslations.title}</h1>
          <p className="text-muted-foreground font-medium italic">{privacyTranslations.lastUpdate}</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">{privacyTranslations.section1Title}</h2>
          <p>{privacyTranslations.section1Desc}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">{privacyTranslations.section2Title}</h2>
          <p>{privacyTranslations.section2Desc}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{privacyTranslations.section2List1}</li>
            <li>{privacyTranslations.section2List2}</li>
            <li>{privacyTranslations.section2List3}</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">{privacyTranslations.section3Title}</h2>
          <p>{privacyTranslations.section3Desc}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">{privacyTranslations.section4Title}</h2>
          <p>{privacyTranslations.section4Desc}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">{privacyTranslations.section5Title}</h2>
          <p>{privacyTranslations.section5Desc}</p>
        </section>
      </div>

      <div className="mt-16 p-8 bg-muted/30 rounded-3xl border text-center">
        <p className="font-bold text-muted-foreground">{privacyTranslations.footerNotice}</p>
        <Link href="/contacto">
          <Button variant="link" className="text-primary font-black mt-2">
            {privacyTranslations.contactBtn}
          </Button>
        </Link>
      </div>
    </div>
  );
}
