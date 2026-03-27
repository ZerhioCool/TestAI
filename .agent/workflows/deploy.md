---
description: Guía definitiva para desplegar TestAI en Vercel y Supabase
---

Para publicar TestAI y que sea accesible desde cualquier lugar, sigue estos pasos estructurados:

### 1. Preparación en GitHub
1. Crea un repositorio en GitHub (ej: `test-ai-saas`).
2. Sube tu código actual:
   ```bash
   git add .
   git commit -m "Listo para producción con Drizzle y Supabase"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/test-ai-saas.git
   git push -u origin main
   ```

### 2. Configuración de Supabase
Sigue los pasos en el nuevo archivo [SUPABASE_SETUP.md](file:///c:/Users/sergi/Documents/TestAi/SUPABASE_SETUP.md) para:
- Crear el proyecto.
- Ejecutar `npx drizzle-kit push` para crear las tablas.
- Configurar la URL de redirección en Auth.

### 3. Despliegue en Vercel (Recomendado)
// turbo
1. Ve a [Vercel.com](https://vercel.com) e importa tu repositorio.
2. En **Environment Variables**, añade exactamente estas variables de tu `.env.local`:
   - `DATABASE_URL`: La connection string con la contraseña real.
   - `NEXT_PUBLIC_SUPABASE_URL`: Tu URL del proyecto Supabase.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu clave anónima pública.
   - `SUPABASE_SERVICE_ROLE_KEY`: Tu clave de rol de servicio (secreta).
   - `GEMINI_API_KEY`: Tu clave de Google AI.
   - `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe (si aplica).
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Tu clave pública de Stripe (si aplica).
   - `STRIPE_WEBHOOK_SECRET`: Se obtiene después de crear el webhook.
   - `NEXT_PUBLIC_APP_URL`: Usa la URL final de Vercel (ej: `https://test-ai-tu-nombre.vercel.app`).

3. Haz clic en **"Deploy"**.

### 4. Ajustes Finales (Webhooks)
- **Stripe**: Crea un webhook en el Dashboard de Stripe que apunte a `https://tu-app.vercel.app/api/webhooks/stripe`.
- **Drizzle**: Si haces cambios locales al esquema, recuerda ejecutar `npx drizzle-kit push` de nuevo apuntando a la DB de producción o usa migraciones con `drizzle-kit generate`.

¡Tu TestAI SaaS ya está en vivo! 🚀
