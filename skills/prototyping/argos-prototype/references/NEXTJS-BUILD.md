# Construcción en Next.js

## Scaffold

**Ubicación**: si el directorio de trabajo actual está vacío, o solo tiene `.git`, el prototipo va ahí. Si no, va en `./<slug>-prototype/`, donde `<slug>` es el slug del frontmatter de Argos. Nunca dentro de la carpeta de los specs.

```bash
npx create-next-app@latest <dir> --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm --yes
```

Después del scaffold:

1. Copia `<skill-dir>/templates/railway.json` a la raíz.
2. En `package.json`, agrega `"engines": { "node": ">=20.9" }`. Deja `"start": "next start"` tal cual: Next.js toma el puerto de la variable `PORT` que inyecta Railway.
3. Copia `<skill-dir>/templates/simulate.ts` a `src/lib/services/simulate.ts`.
4. Crea `docs/` con `BRIEF.md`, `TRACEABILITY.md` y `DECISIONS.md` (ver PROTOTYPE-PLAN.md).
5. Reemplaza el README del scaffold por uno corto: qué es, `npm install && npm run dev`, cómo cambiar de rol, cómo disparar los caminos alternativos y enlaces a `docs/`.
6. `git init` (si no hay repo) y verifica que `.gitignore` incluya `.next/`, `node_modules/` y `.env*`.

## Restricciones: frontend puro

- Sin base de datos, ORM, auth real, variables de entorno con secretos ni servicios externos. El prototipo debe funcionar con `npm install && npm run build && npm run start` en una máquina limpia.
- Sin Route Handlers ni Server Actions que persistan algo. Los "backends" son los servicios simulados de `src/lib/services/`.
- La persistencia de la demo vive en el estado del cliente, con `localStorage` como respaldo para que sobreviva a un recargo. El botón "Reiniciar demo" restaura los datos semilla.
- Sin fuentes ni imágenes de CDNs no controlados en tiempo de ejecución. Las fuentes van con `next/font`, que las empaqueta en el build.

## Convenciones

```
src/
  app/                    # una carpeta por ruta de TRACEABILITY.md
    layout.tsx            # shell, navegación por rol, barra de prototipo
    page.tsx              # punto de entrada del actor principal (no una landing genérica)
    prototipo/page.tsx    # mapa del prototipo: rutas, roles e IDs del spec para quien presenta
  components/
    ui/                   # primitivas del sistema de DESIGN.md
    <dominio>/            # componentes de cada pantalla
  lib/
    types.ts              # tipos de las entidades `data`
    mock/                 # datos semilla, un archivo por entidad
    services/             # operaciones simuladas (async, latencia, deterministas)
    store.tsx             # estado de la demo: rol, segmento, entidades; persistencia en localStorage
```

- **Server Components por defecto.** `"use client"` solo en hojas interactivas y en el `store`.
- **Hidratación**: lee `localStorage` en un `useEffect` o con `useSyncExternalStore`, nunca durante el render inicial. Así no aparecen errores de hidratación.
- **Estados por pantalla**: cada pantalla implementa sus `visual_states` del spec. Como mínimo: vacío, cargando (skeleton, no spinner suelto), error con acción de recuperación, y éxito.
- **Textos**: en el idioma del spec, usando el vocabulario del dominio (los términos de Argos, no sinónimos inventados). Los mensajes de error y de los hallazgos salen de `error_handling` y `acceptance_criteria`.
- **Barra de prototipo**: discreta y fija. Lleva el selector de rol, el selector de segmento (si aplica), "Reiniciar demo" y un enlace a `/prototipo`. Debe verse claramente distinta de la UI del producto.
- **Metadatos**: `title` y `description` del proyecto en `layout.tsx`, `lang` del idioma del spec en `<html>` y un favicon simple derivado del diseño.
- **Accesibilidad**: HTML semántico, etiquetas en todos los controles, foco visible, navegación por teclado en los flujos principales y contraste AA.
