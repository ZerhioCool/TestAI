"use client";

import Link from "next/link";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { t } = useLanguage();
  const authT = t("auth");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-xl animate-in zoom-in-95 duration-500">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {authT.loginTitle}
          </CardTitle>
          <CardDescription>
            {authT.loginSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium text-center">
              {error}
            </div>
          )}
          
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{authT.emailLabel}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{authT.passwordLabel}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="space-y-4 pt-4">
              <Button type="submit" formAction={login} className="w-full">
                {authT.loginBtn}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-sm text-center pt-2 pb-6 px-6">
          <p className="text-muted-foreground">
            {authT.noAccount}{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">
              {authT.joinFree}
            </Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
