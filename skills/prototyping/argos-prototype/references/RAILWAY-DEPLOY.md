# Despliegue en Railway

El prototipo ya trae lo que Railway necesita: `railway.json` (builder Railpack, `npm run build`, `npm run start` y healthcheck en `/`) y el campo `engines.node` en `package.json`. Railway inyecta `PORT` y `next start` lo respeta. El prototipo no necesita variables de entorno.

Tú no despliegas. Haces el commit inicial y le entregas al usuario estas instrucciones, con `<ruta>` y `<nombre>` reemplazados por los valores reales.

## Instrucciones para el usuario

> **Probar en local**
> ```bash
> cd <ruta>
> npm install
> npm run dev        # http://localhost:3000
> ```
>
> **Opción A: desde GitHub (recomendada, redeploy automático en cada push)**
> 1. Crea un repositorio vacío en GitHub llamado `<nombre>`.
> 2. Sube el código:
>    ```bash
>    git branch -M main
>    git remote add origin https://github.com/<tu-org>/<nombre>.git
>    git push -u origin main
>    ```
> 3. En [railway.com](https://railway.com) → **New Project** → **Deploy from GitHub repo** → elige `<nombre>`. Si es la primera vez, autoriza a Railway en tu cuenta u organización de GitHub.
> 4. Railway detecta `railway.json` y construye solo. No hace falta configurar variables.
> 5. Cuando el deploy quede en **Active**: **Settings → Networking → Generate Domain**. Esa URL pública es el prototipo.
>
> **Opción B: desde la terminal con Railway CLI (sin GitHub)**
> ```bash
> npm i -g @railway/cli
> railway login
> cd <ruta>
> railway init          # crea el proyecto en Railway
> railway up            # sube y despliega el código local
> railway domain        # genera la URL pública
> ```
>
> **Si algo falla**
> - *Build failed*: corre `npm run build` en local. Lo que falle ahí es lo mismo que falla en Railway.
> - *Application failed to respond*: revisa que `start` en `package.json` sea `next start` sin un puerto fijo.
> - *Healthcheck failed*: la ruta `/` debe responder sin datos externos. Revisa los logs del deploy en Railway.
