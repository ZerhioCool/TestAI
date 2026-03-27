# Guía de Configuración de Supabase para TestAI

Este documento detalla los pasos necesarios para configurar Supabase correctamente para tu proyecto TestAI.

## 1. Crear el Proyecto
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard).
2. Crea un **Nuevo Proyecto**.
3. Guarda la **Database Password** en un lugar seguro; la necesitarás para el `DATABASE_URL`.

## 2. Obtener Credenciales y URL
En la configuración de tu proyecto (`Settings -> API`):
- **Project URL**: Úsala para `NEXT_PUBLIC_SUPABASE_URL`.
- **anon key**: Úsala para `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **service_role key**: Úsala para `SUPABASE_SERVICE_ROLE_KEY` (Mantenla privada).

En la configuración de la base de datos (`Settings -> Database`):
- **Connection string**: Selecciona `URI`. Reemplaza `[YOUR-PASSWORD]` con tu contraseña real. Úsala para `DATABASE_URL`.
  - *Nota*: Asegúrate de que el modo sea `Transaction` (puerto 6543) o `Session` (puerto 5432). Para Drizzle, se recomienda el puerto 5432 con `sslmode=require`.

## 3. Sincronizar la Base de Datos (Drizzle)
TestAI usa Drizzle ORM para gestionar la base de datos. Una vez que tengas tu `DATABASE_URL` en el archivo `.env.local`, ejecuta:

```bash
npx drizzle-kit push
```

Este comando creará todas las tablas necesarias (`users`, `quizzes`, `questions`, etc.) en tu instancia de Supabase de forma instantánea.

## 4. Configurar Autenticación
Para que el inicio de sesión funcione en producción:
1. Ve a `Authentication -> URL Configuration`.
2. **Site URL**: Cámbialo a tu URL de Vercel (ej. `https://tu-app.vercel.app`).
3. **Redirect URLs**: Añade `https://tu-app.vercel.app/**`.

## 5. Habilitar el Agregador de Consultas (Pooler)
Si experimentas errores de conexión en Vercel, asegúrate de activar el **IPv4 address** o usar el **Connection Pooler** (puerto 6543) en la configuración de la base de datos de Supabase.
