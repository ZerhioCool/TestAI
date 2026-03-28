"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, UserRound, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface JoinFormProps {
  prefilledPin?: string;
}

export function JoinForm({ prefilledPin = "" }: JoinFormProps) {
  const { language, t } = useLanguage();
  const joinT = t('join');
  const router = useRouter();

  const [pin, setPin] = useState(prefilledPin);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || !name) {
      setError(joinT.errorFields);
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/quiz/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, name, language }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error === "Room not found" ? joinT.errorNotFound : (data.error || "Error"));
        setIsPending(false);
        return;
      }

      // Redirigir a la sala de espera
      router.push(`/quiz/${data.quizId}/live?guest=${encodeURIComponent(name)}`);

    } catch (err) {
      setError("Connection error");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-black rounded-2xl text-center animate-in shake duration-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative group">
          <Input 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            type="text"
            inputMode="numeric"
            placeholder={joinT.pinPlaceholder}
            className="pl-14 h-16 text-center text-4xl font-mono tracking-[0.5em] focus:tracking-[0.5em] font-black rounded-2xl border-2 transition-all group-hover:border-primary/50"
            required
            maxLength={5}
          />
          <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6 group-focus-within:text-primary transition-colors" />
        </div>

        <div className="relative group">
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder={joinT.namePlaceholder}
            className="pl-14 h-16 text-xl font-bold rounded-2xl border-2 transition-all group-hover:border-primary/50"
            required
            maxLength={20}
          />
          <UserRound className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6 group-focus-within:text-primary transition-colors" />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isPending}
        className="w-full h-16 text-2xl font-black bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
      >
        {isPending ? <Loader2 className="h-8 w-8 animate-spin" /> : joinT.btn}
      </Button>
    </form>
  );
}
