"use client";

import Link from "next/link";
import { registerUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/context/LanguageContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterForm() {
  const { t } = useLanguage();
  const authT = t("auth");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <Card className="w-full max-w-lg shadow-xl animate-in zoom-in-95 duration-500">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          {authT.registerTitle}
        </CardTitle>
        <CardDescription>
          {authT.registerSubtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium text-center">
            {error}
          </div>
        )}
        
        <form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{authT.fullNameLabel}</Label>
              <Input id="fullName" name="fullName" placeholder={authT.fullNamePlaceholder} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{authT.emailLabel}</Label>
              <Input id="email" name="email" type="email" placeholder="tu@correo.com" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">{authT.passwordLabel}</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{authT.confirmPasswordLabel}</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">{authT.roleLabel}</Label>
              <select 
                id="role" 
                name="role" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
                defaultValue=""
              >
                <option value="" disabled>{authT.rolePlaceholder}</option>
                <option value="estudiante">{authT.roleStudent}</option>
                <option value="profesor">{authT.roleTeacher}</option>
                <option value="empleado">{authT.roleCorporate}</option>
                <option value="otro">{authT.roleOther}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">{authT.purposeLabel}</Label>
              <select 
                id="purpose" 
                name="purpose" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
                defaultValue=""
              >
                <option value="" disabled>{authT.purposePlaceholder}</option>
                <option value="recreativo">{authT.purposePersonal}</option>
                <option value="comercial">{authT.purposeBusiness}</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t mt-6">
            <div className="flex items-start space-x-2 pt-4">
              <Checkbox id="terms" name="terms" required />
              <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-snug">
                {authT.termsLabel}
              </Label>
            </div>
            
            <Button type="submit" formAction={registerUser} className="w-full text-md py-6">
              {authT.registerBtn}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col text-sm text-center pt-2 pb-6 px-6">
        <p className="text-muted-foreground">
          {authT.alreadyHaveAccount}{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            {authT.loginHere}
          </Link>.
        </p>
      </CardFooter>
    </Card>
  );
}

export default function RegisterPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col items-center justify-center py-12 px-4">
      <Suspense fallback={<div className="text-muted-foreground animate-pulse">{t('common').loading}</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
