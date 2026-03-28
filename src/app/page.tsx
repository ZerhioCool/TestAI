"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, FileText, Gamepad2, Upload } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const homeT = t('home');

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        {/* Background gradient effects */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium transition-colors hover:bg-muted">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            {homeT.badge}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-balance">
            {homeT.heroTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">{homeT.heroHighlight}</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground md:text-2xl text-balance font-medium">
            {homeT.heroSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/upload" 
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "rounded-full h-14 px-10 text-lg font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              )}
            >
              <Upload className="mr-2 h-5 w-5" />
              {homeT.uploadBtn}
            </Link>
            <Link href="/join">
              <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg shadow-sm font-black border-2 hover:bg-muted transition-all hover:scale-105 active:scale-95">
                <Gamepad2 className="mr-2 h-5 w-5" />
                {homeT.playBtn}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center space-y-4 mb-16 animate-in fade-in duration-700">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">{homeT.featuresTitle}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-xl font-medium">
              {homeT.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileText className="h-10 w-10 text-primary" />}
              title={homeT.feature1Title}
              description={homeT.feature1Desc}
            />
            <FeatureCard 
              icon={<BrainCircuit className="h-10 w-10 text-purple-600" />}
              title={homeT.feature2Title}
              description={homeT.feature2Desc}
            />
            <FeatureCard 
              icon={<Gamepad2 className="h-10 w-10 text-success" />}
              title={homeT.feature3Title}
              description={homeT.feature3Desc}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-xl bg-background/60 backdrop-blur-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl overflow-hidden p-2">
      <CardContent className="p-8 space-y-6 flex flex-col items-center text-center">
        <div className="p-5 bg-muted rounded-[2rem] shadow-inner mb-2">
          {icon}
        </div>
        <h3 className="text-2xl font-black">{title}</h3>
        <p className="text-muted-foreground leading-relaxed font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}
