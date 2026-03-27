import Link from "next/link"
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-xl animate-in zoom-in-95 duration-500">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Bienvenido a TestAI</CardTitle>
          <CardDescription>Inicia sesión o crea una cuenta nueva instantáneamente</CardDescription>
        </CardHeader>
        <CardContent>
          {resolvedParams.error && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium text-center">
              {resolvedParams.error}
            </div>
          )}
          
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
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
                Iniciar Sesión
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-sm text-center pt-2 pb-6 px-6">
          <p className="text-muted-foreground">
            ¿No tienes cuenta? <Link href="/register" className="font-bold text-primary hover:underline">Únete a TestAI gratis</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
