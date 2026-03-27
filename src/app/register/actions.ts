'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { usersTable } from '@/db/schema'

export async function registerUser(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string
  const purpose = formData.get('purpose') as string
  const termsAccepted = formData.get('terms') === 'on'

  if (password !== confirmPassword) {
    redirect('/register?error=' + encodeURIComponent('Las contraseñas no coinciden.'))
  }
  if (!termsAccepted) {
    redirect('/register?error=' + encodeURIComponent('Debes aceptar los términos y condiciones.'))
  }

  // Crear usuario en Auth
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        purpose
      }
    }
  })

  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message))
  }

  // Guardar ficha extendida en PostgreSQL Drizzle
  if (authData.user) {
    try {
      await db.insert(usersTable).values({
        id: authData.user.id,
        email: authData.user.email!,
        fullName,
        role,
        purpose,
        termsAccepted
      }).onConflictDoNothing()
    } catch (dbError) {
      console.error("No se pudo insertar perfil extendido en DB:", dbError)
    }
  }

  if (!authData.session) {
    redirect('/login?error=' + encodeURIComponent('✅ Cuenta creada exitosamente. Revisa tu bandeja de entrada para verificar tu correo electrónico.'))
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
