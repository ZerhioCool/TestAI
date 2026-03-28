"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JoinForm } from "@/components/quiz/JoinForm";
import { useLanguage } from "@/context/LanguageContext";

interface JoinUIProps {
  prefilledPin?: string;
  errorMessage?: string;
}

export function JoinUI({ prefilledPin, errorMessage }: JoinUIProps) {
  const { t } = useLanguage();
  const joinT = t('join');

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] bg-muted/20 px-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
        <Card className="w-full shadow-2xl border-primary/10 relative overflow-hidden rounded-[2.5rem]">
          {/* Decoración Superior Premium */}
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-purple-500 to-indigo-600" />
          
          <CardHeader className="text-center pt-12 pb-8">
            <CardTitle className="text-4xl font-extrabold tracking-tight">{joinT.title}</CardTitle>
            <CardDescription className="text-lg mt-3 font-medium text-balance">{joinT.subtitle}</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-10">
            <JoinForm prefilledPin={prefilledPin} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
