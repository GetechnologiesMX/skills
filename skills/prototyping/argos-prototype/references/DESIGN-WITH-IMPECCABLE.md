# Diseño con impeccable

[impeccable](https://impeccable.style) (`pbakaus/impeccable`) le da al agente vocabulario de diseño, un piso de calidad y un detector de "AI slop". Aquí lo usas como **director de diseño**: impeccable propone y construye la dirección visual, y tú decides en nombre del usuario.

## 1. Asegurar que está instalado

Si `impeccable` aparece en tus skills disponibles, úsalo. Si no, busca un `SKILL.md` en `.claude/skills/impeccable/`, `.agents/skills/impeccable/` o `~/.claude/skills/impeccable/`. Si tampoco está, instálalo en el prototipo desde su raíz:

```bash
npx impeccable install --providers=<tu-herramienta> --scope=project   # claude, codex, cursor…
```

Una instalación nueva no aparece entre tus skills hasta que se recarga la herramienta. No esperes a la recarga: lee el `SKILL.md` instalado y sigue sus instrucciones como si lo hubieras invocado, incluida su sección Setup. Si la instalación falla, la alternativa es `npx skills add pbakaus/impeccable`. Si eso también falla, sigue sin impeccable con el piso de calidad de la sección 4 y anótalo en `DECISIONS.md`.

## 2. Darle contexto sin preguntarle al usuario

impeccable trabaja a partir de `PRODUCT.md`, que normalmente crea `init` con preguntas. Esas preguntas las respondes tú con `docs/BRIEF.md` y el spec, sin pasarlas al usuario:

- **Para quién**: los actores de §4.
- **Qué debe hacer**: el recorrido de la demo y las pantallas de `TRACEABILITY.md`.
- **Restricciones**: las de §1, más "prototipo frontend con datos ficticios".
- **Marca**: el nombre del cliente que aparece en §1. Si el spec menciona marca, colores o tipografía, eso **manda** sobre cualquier preferencia estética. Si no menciona nada, la dirección es libre.

Configura el camino **code-led**, que construye directo en código sin mockups de imagen: `/impeccable use code-led as this project's default for new design work`. Es más coherente en la primera construcción y no depende de que haya generación de imágenes.

## 3. Elegir la dirección

Pide el diseño nuevo nombrando la superficie principal del recorrido de la demo, por ejemplo: `/impeccable design the <pantalla principal> for <actor principal>: <propósito en una línea>`. Sigue su playbook de trabajo nuevo.

Elige el **modo** según lo que el spec dice de la superficie:

| Señal en el spec | Modo de impeccable |
|---|---|
| Herramienta interna, back-office, validación, operación diaria, tablas y estados | **Operate**: precisión, densidad legible, patrones conocidos |
| Consulta de información, reportes, documentación | **Read** |
| Autoservicio para público general (pacientes, clientes) | **Operate** con más calidez y guía paso a paso |
| Landing, captación, campaña | **Persuade** |

Cuando impeccable ofrezca direcciones o un selector, **eliges tú**. Toma la que mejor sirva a los objetivos de los actores y al recorrido de la demo, y no la más llamativa. Registra en `DECISIONS.md` las opciones que hubo, cuál elegiste y por qué. Con la dirección elegida, `/impeccable document` escribe `DESIGN.md`. Todas las pantallas siguientes heredan ese sistema.

## 4. Construir y revisar

- Antes de editar UI, lee el `reference/craft-floor.md` de impeccable: es su piso de calidad y sus prohibiciones absolutas.
- Las pantallas secundarias se construyen dentro del sistema de `DESIGN.md`, sin abrir direcciones nuevas.
- Revisión en el paso 7: `npx impeccable detect src/`, luego `/impeccable critique` sobre las 2 o 3 pantallas del recorrido de la demo, luego `/impeccable polish` y `/impeccable harden` (estados de error, textos largos, overflow).

Si se trabaja sin impeccable, el piso mínimo es: una tipografía con carácter elegida para el dominio, una paleta de tokens con un acento, jerarquía clara por tamaño y peso, estados vacío, cargando y error diseñados, contraste AA y foco visible.
