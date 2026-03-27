---
description: Cómo desplegar TestAI en Vercel o Netlify
---

Para publicar TestAI y que sea accesible desde cualquier lugar, sigue estos pasos:

### 1. Preparación del Código
- He verificado que el proyecto compila correctamente para producción (`npm run build` pase sin errores).
- He limpiado los archivos temporales de depuración para que no interfieran con el despliegue.

### 2. Pasos en GitHub
1. Crea un nuevo repositorio en GitHub (puedes llamarlo `quiz-ai`).
2. Sube tu código local al repositorio:
   ```bash
   git add .
   git commit -m "Preparado para despliegue"
   git push origin main
   ```

### 3. Pasos en Vercel (Recomendado)
// turbo
1. Ve a [Vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **"Add New"** -> **"Project"**.
3. Selecciona tu repositorio `quiz-ai`.
4. En **"Environment Variables"**, añade todas las variables de tu archivo `.env.local`:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_APP_URL` (Usa la URL que te asigne Vercel al final).
5. Haz clic en **"Deploy"**.

### 4. Ajustes Finales
- En **Supabase Dashboard**: Ve a Authentication -> URL Configuration -> Site URL y añade la URL de Vercel.
- En **Stripe Dashboard**: Crea un nuevo Webhook que apunte a `https://tu-app.vercel.app/api/webhook/stripe`.

¡Tu TestAI SaaS estará en vivo en pocos minutos! 🚀
