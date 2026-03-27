import Link from "next/link";
import { registerUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg shadow-xl animate-in zoom-in-95 duration-500">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Crea tu cuenta gratis</CardTitle>
          <CardDescription>Únete a la nueva era de evaluación interactiva con IA</CardDescription>
        </CardHeader>
        <CardContent>
          {resolvedParams.error && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium text-center">
              {resolvedParams.error}
            </div>
          )}
          
          <form className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input id="fullName" name="fullName" placeholder="Ej. Ana Pérez" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" name="email" type="email" placeholder="tu@correo.com" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">¿A qué te dedicas?</Label>
                <select 
                  id="role" 
                  name="role" 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled selected>Selecciona un rol...</option>
                  <option value="estudiante">Estudiante / Universitaro</option>
                  <option value="profesor">Profesor / Docente</option>
                  <option value="empleado">Profesional Corporativo / RRHH</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Propósito de Uso</Label>
                <select 
                  id="purpose" 
                  name="purpose" 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled selected>Selecciona un propósito...</option>
                  <option value="recreativo">Estudio o Uso Personal</option>
                  <option value="comercial">Comercial / Empresa</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t mt-6">
              <div className="flex items-start space-x-2 pt-4">
                <Checkbox id="terms" name="terms" required />
                <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-snug">
                  He leído y acepto los <Link href="#" className="font-semibold text-primary hover:underline">Términos de Servicio</Link> y la Política de Privacidad, incluyendo el uso de mis datos para mejorar el producto.
                </Label>
              </div>
              
              <Button type="submit" formAction={registerUser} className="w-full text-md py-6">
                Crear Mi Cuenta Segura
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-sm text-center pt-2 pb-6 px-6">
          <p className="text-muted-foreground">
            ¿Ya tienes una cuenta? <Link href="/login" className="font-bold text-primary hover:underline">Inicia Sesión aquí</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
