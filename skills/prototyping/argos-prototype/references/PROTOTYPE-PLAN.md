# Plan del prototipo

El plan vive en `docs/` dentro del prototipo y se versiona con el código. Son tres documentos, cada uno con una sola responsabilidad.

## `docs/BRIEF.md`: lo que entendiste

Una página como máximo, en el idioma del spec:

- **Producto**: nombre, problema y visión en tres líneas (§1).
- **Actores → roles**: cada actor de §4, con sus objetivos y las pantallas que usa.
- **Recorrido de la demo**: la historia que contará quien presente el prototipo, en 5 a 8 pasos, con el camino feliz principal y un error interesante.
- **Fuera de alcance**: las restricciones de §1 que limitan la UI.

`BRIEF.md` también alimenta el `PRODUCT.md` de impeccable (ver DESIGN-WITH-IMPECCABLE.md).

## `docs/TRACEABILITY.md`: lo que se construye

Hay una fila por cada `UI-*` y cada `UC-*`. Los `FR-*` y `BR-*` van dentro de la fila del caso de uso o la pantalla que los cubre (usa `--graph`).

```markdown
| ID | Título | Estado spec | Ruta / componente | Requisitos y reglas cubiertos | Estado |
|---|---|---|---|---|---|
| UI-002 | Superficie de carga documental | confirmado | `/atenciones/[id]/cargar` | FR-031, FR-032, BR-004 | ⏳ |
| UC-014 | Validar datos administrativos | confirmado | servicio `validateDocument` → `/documentos/[id]` | FR-005, FR-006 | ⏳ |
| UC-030 | Exclusión de validación clínica | confirmado | fuera de alcance: regla negativa, sin UI propia | — | — |
```

La columna `Estado` pasa de `⏳` a `✅` durante el paso 6. Un caso de uso **sin pantalla propia** se mapea a la pantalla donde el usuario ve su efecto, por ejemplo un hallazgo en la vista de resultado.

## `docs/DECISIONS.md`: lo que decidiste

Cada ambigüedad que resolviste sin preguntar se registra con el mismo formato:

```markdown
## D-003 · Simular el OCR con resultados deterministas por nombre de archivo
- **Contexto:** UC-018 depende de un motor IA/OCR (ARCH-005) que no existe en un prototipo frontend.
- **Decisión:** `simulateOcr()` devuelve hallazgos fijos según el nombre del archivo (`*-error*` → hallazgos, cualquier otro → validado), con 1.5–3 s de latencia.
- **Fuente:** UC-018 `alternative_paths`, nota §8 [high] sobre datasets pendientes.
```

Son decisiones obligatorias: dirección de diseño (paso 5), pantallas derivadas, campos con coverage `partial`, notas `[high]` de §8 y cada hallazgo del detector que dejes sin corregir.

## Cómo se traduce el spec

- **Roles**: cada actor es un rol. Una barra discreta de prototipo permite cambiar de rol y reiniciar los datos de la demo. La navegación y las acciones respetan los permisos del rol.
- **Segmentación**: si el spec separa por país, sede o tenant, agrega un selector. Los datos mock vienen segregados.
- **Servicios simulados**: cada operación que en producción llamaría a un backend (`api`, integraciones, motores) es una función async en `src/lib/services/`. Tiene latencia realista y resultados **deterministas**, que dependen de la entrada y no de `Math.random`, para que la demo sea repetible. Cada camino alternativo del caso de uso debe poder dispararse con una entrada conocida, documentada en la barra de prototipo o en `DECISIONS.md`.
- **Datos mock**: son ficticios pero verosímiles y coherentes entre entidades: el paciente de la atención es el mismo del documento. Usa nombres, documentos de identidad, monedas y formatos de fecha del país del spec. Cada pantalla tiene datos suficientes para verse viva, por ejemplo 8 a 20 filas por listado, y al menos un registro en cada estado posible.
- **Reglas negativas** ("fuera de alcance", "no reemplaza a…"): no generan pantallas. Si el spec pide comunicarlas al usuario, se convierten en textos de la UI, por ejemplo "La certificación no sustituye la revisión de facturación".
