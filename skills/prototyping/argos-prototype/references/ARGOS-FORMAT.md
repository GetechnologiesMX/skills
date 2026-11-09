# Formato de los exports de Argos

Argos exporta cada proyecto como Markdown con frontmatter `schema_version: mind.export.md.v1`. El contenido cambia por proyecto; la estructura no.

## Archivos y scopes

Cada archivo se llama `<slug>-<scope>-<fecha>.md`. El `scope` también aparece en el frontmatter.

| Scope | Contiene | Peso típico |
|---|---|---|
| `contexto` | §1 Identidad, §2 Stakeholders, §3 Pipeline, §4 Contexto (actores), §8 Notas | ~15 KB |
| `funcional` | §1–§3, §5 Funcional, §7 Grafo, §8 | ~400 KB |
| `tecnico` | §1–§3, §6 Técnico, §7 Grafo, §8 | ~330 KB |
| `full` | todas las secciones juntas | ~700 KB |

El usuario puede entregar cualquier combinación. `argos-index.mjs` deduplica: los bloques de los archivos por scope tienen prioridad sobre los de `full`. Si solo hay `full`, todo sale de ahí.

## Secciones

- **§1 Identidad**: nombre, descripción, **visión**, **problema**, **métricas de éxito** y **restricciones**. Es la fuente del tono, del propósito y de lo que queda fuera de alcance.
- **§2 Stakeholders**: roles y dominios. Sirve para saber a quién se le hará la demo.
- **§3 Estado del pipeline**: indica qué fases generó Argos. Una fase `pending` puede venir vacía.
- **§4 Contexto › Actores del sistema**: actores con su descripción y objetivos. **Cada actor es un rol del prototipo.**
- **§5 Funcional / §6 Técnico**: los bloques (ver abajo).
- **§7 Grafo de relaciones**: aristas `` `A` --[relación]--> `B` `` (`covers`, `requires`, `constrains`…). Úsalas para encontrar los requisitos que cubre un caso de uso.
- **§8 Notas abiertas**: decisiones, bloqueadores y supuestos con severidad (`[info]`, `[high]`…). Una nota `[high]` sin resolver se convierte en un supuesto explícito en `DECISIONS.md`.

## Bloques

Cada bloque es un `### Título` con metadatos y un payload JSON:

````markdown
### Superficie de carga documental
- **Tipo:** screen
- **Estado:** confirmado
- **ID:** UI-002
- **Descripción:** …

```json
{ "layout": { "value": "…", "coverage": "complete", "rationale": "…", "updated_at": "…" }, … }
```
````

- **Estado**: `confirmado` es la verdad acordada. `pendiente` es una propuesta: constrúyela, pero márcala en `TRACEABILITY.md`.
- **coverage** de cada campo: `complete` / `well_defined` se implementan tal cual. `partial` o vacío se completa con un supuesto razonable que se registra en `DECISIONS.md`.

### Tipos y su peso en el prototipo

| Tipo (prefijo de ID) | Campos clave | Uso en el prototipo |
|---|---|---|
| `screen` (UI-) | `fields`, `layout`, `actions`, `navigation`, `visual_states` | **Fuente principal.** Una ruta por pantalla, con su layout, acciones, navegación y todos sus estados visuales, al pie de la letra. |
| `use_case` (UC-) | `flow_steps`, `alternative_paths`, `flow_conditions`, `scenarios` | Flujos recorribles de punta a punta. Cada camino alternativo y cada escenario se puede disparar en la demo. |
| `requirement` (FR-) | `functional_behavior`, `acceptance_criteria`, `error_handling`, `state_conditions` | Comportamiento y mensajes de la UI. Los criterios de aceptación son la lista de chequeo. |
| `rule` (BR-) | `rule_definition`, `exceptions`, `enforcement` | Lógica de los servicios simulados y textos de la UI. |
| `data` (DATA-) | `entities`, `schema`, `relationships`, `data_lifecycle` | Tipos TypeScript y datos mock. |
| `api` (API-) | `endpoints`, `schemas`, `error_contract` | Firma de los servicios simulados y forma de sus respuestas. Nada de HTTP real. |
| `nfr` (NFR-) | `quality_target` | Solo lo perceptible: latencias simuladas creíbles, accesibilidad. |
| `architecture`, `security`, `compliance` | — | Fuera del prototipo, salvo lo que el usuario **ve**: roles y permisos, segregación por país o tenant, avisos de privacidad. |

## Estrategia de lectura

Los exports pesan cientos de KB. Navégalos con el script y lee los archivos solo en los números de línea que reporta.

```bash
S=<skill-dir>/scripts/argos-index.mjs
node $S <ruta>                         # índice de screen/use_case/requirement/rule/data
node $S <ruta> --section 1             # también 2, 4 y 8
node $S <ruta> --show UI-001,UI-002    # bloques completos con los JSON expandidos
node $S <ruta> --type api,nfr          # índice de otros tipos
node $S <ruta> --graph UC-011          # requisitos que cubre o restringe un ID
node $S <ruta> --all                   # índice de todos los tipos
```

Orden: índice → §1, §2, §4, §8 → `--show` de todos los `screen` → `--show` de todos los `use_case` → `--show` de todas las `rule` → `--graph` de cada `use_case` y `--show` de sus `requirement` → `--show` de las entidades `data` que aparecen en pantallas.

Si el proyecto no tiene bloques `screen`, derívalos de los casos de uso: una superficie por cada momento de interacción distinto que tenga un actor. Registra cada pantalla derivada en `DECISIONS.md`.
