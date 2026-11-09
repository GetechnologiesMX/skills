---
name: argos-prototype
description: "Construye un prototipo funcional en Next.js (solo frontend, datos mock, sin base de datos ni infraestructura) listo para desplegar en Railway, a partir de los exports de especificación de Argos (archivos .md con `schema_version: mind.export.md.v1`, scopes contexto/funcional/tecnico/full). Usar cuando el usuario quiera prototipar, maquetar o montar un demo desde specs de Argos."
---

# Argos Prototype

Convierte las especificaciones que exporta Argos en un **prototipo navegable**: una app Next.js que se siente real (pantallas completas, flujos de punta a punta, datos verosímiles, estados de carga, error y vacío) pero que corre 100 % en el navegador, con datos mock y servicios simulados. Termina con instrucciones para que el usuario la despliegue en Railway.

El usuario delega **todas** las decisiones. Haces **una sola pregunta** (paso 1). Cualquier otra ambigüedad la resuelves tú y la registras en `DECISIONS.md` del prototipo. Las demás preguntas solo están permitidas en la entrega del paso 8.

`<skill-dir>` es la carpeta que contiene este `SKILL.md`.

## Pasos

### 1. Ubicar los specs

Pregunta, en el idioma del usuario: **"¿En qué carpeta (o archivos) están las especificaciones exportadas de Argos?"**

Luego ejecuta:

```bash
node <skill-dir>/scripts/argos-index.mjs "<ruta>"
```

**Hecho cuando:** el script imprime el encabezado del proyecto (`# <nombre> (<slug>)`) y su lista de archivos. Si sale con código 2, la ruta no tiene exports de Argos: dile al usuario qué encontraste y vuelve a preguntar.

### 2. Leer el spec

Lee [references/ARGOS-FORMAT.md](references/ARGOS-FORMAT.md) y aplica su estrategia de lectura. No abras los `.md` completos. Navega con `argos-index.mjs` (`--section`, `--type`, `--show`, `--graph`).

**Hecho cuando:** leíste §1, §2, §4 y §8, y cada bloque `screen`, `use_case` y `rule` completo con `--show`. Debes poder responder, para cada actor de §4: qué pantallas usa, qué casos de uso ejecuta y qué ve cuando algo falla.

### 3. Crear el proyecto

Sigue [references/NEXTJS-BUILD.md](references/NEXTJS-BUILD.md) § Scaffold.

**Hecho cuando:** `npm run build` pasa sobre el scaffold limpio, y `railway.json` más la carpeta `docs/` del prototipo están en su lugar.

### 4. Planear el prototipo

Sigue [references/PROTOTYPE-PLAN.md](references/PROTOTYPE-PLAN.md). Escribe `docs/BRIEF.md`, `docs/TRACEABILITY.md` y `docs/DECISIONS.md` dentro del prototipo.

**Hecho cuando:** **cada** ID `UI-*` y `UC-*` del spec tiene una fila en `TRACEABILITY.md`, con una ruta o con `fuera de alcance` y su razón. Cada entidad `data` que alimenta una pantalla tiene su tipo TypeScript planeado.

### 5. Elegir el diseño con impeccable

Sigue [references/DESIGN-WITH-IMPECCABLE.md](references/DESIGN-WITH-IMPECCABLE.md).

**Hecho cuando:** existen `PRODUCT.md` y `DESIGN.md` en la raíz del prototipo, y `DECISIONS.md` registra la dirección elegida, el modo y por qué encaja con lo que dice el spec.

### 6. Construir

Implementa fila por fila de `TRACEABILITY.md`, siguiendo [references/NEXTJS-BUILD.md](references/NEXTJS-BUILD.md) § Convenciones y la dirección de diseño de impeccable.

**Hecho cuando:** cada fila con ruta está marcada `✅`. Cada caso de uso se puede recorrer en el navegador de punta a punta, con su camino feliz, sus caminos alternativos y sus errores. Cada pantalla tiene sus estados `visual_states` del spec (vacío, cargando, error, éxito).

### 7. Verificar

1. `npm run build` y, si `package.json` lo define, `npm run lint`: los dos en verde.
2. `npx impeccable detect src/`: sin hallazgos, o cada hallazgo restante justificado en `DECISIONS.md`.
3. Pasa `/impeccable critique` y luego `/impeccable polish` sobre las pantallas principales. Corrige todo lo P0 y P1.
4. Levanta `npm run start` y recorre cada caso de uso de `TRACEABILITY.md` en el navegador, a 390 px y a 1440 px de ancho. Si no tienes herramientas de navegador, recórrelo leyendo el código, y declara en la entrega que no hubo verificación visual.

**Hecho cuando:** los cuatro puntos están cumplidos. Un build en rojo nunca se entrega.

### 8. Entregar

Haz el commit inicial del prototipo y entrega al usuario las instrucciones de [references/RAILWAY-DEPLOY.md](references/RAILWAY-DEPLOY.md) § Instrucciones para el usuario, con la ruta real del proyecto y su nombre.

**Hecho cuando:** el usuario tiene en un solo mensaje: la ruta del prototipo, cómo correrlo en local, los pasos para Railway y un resumen de `DECISIONS.md` (supuestos principales y lo que quedó fuera de alcance).
