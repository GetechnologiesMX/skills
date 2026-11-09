---
schema_version: mind.export.md.v1
id: 00000000-0000-0000-0000-000000000001
slug: demo-reservas
name: Demo - Reservas
scope: funcional
created_at: 2026-01-01T00:00:00+00:00
exported_at: 2026-11-08T00:00:00Z
pipeline_status:
  contexto: generated
  funcional: generated
  tecnico: pending
---

## §1 Identidad

**Nombre:** Demo - Reservas

## §5 Funcional

### Agenda de reservas
- **Tipo:** screen
- **Estado:** confirmado
- **ID:** UI-001
- **Descripción:** Pantalla donde la recepcionista ve las reservas del día.

```json
{
  "layout": {
    "value": "Lista de reservas del día ordenada por hora.",
    "coverage": "complete",
    "rationale": "Definido por negocio.",
    "updated_at": "2026-01-01T00:00:00+00:00"
  },
  "visual_states": {
    "value": "- Vacío: \"No hay reservas hoy\".",
    "coverage": "partial",
    "rationale": "Solo se definió el estado vacío.",
    "updated_at": "2026-01-01T00:00:00+00:00"
  }
}
```

### Confirmar reserva
- **Tipo:** use_case
- **Estado:** pendiente
- **ID:** UC-001
- **Descripción:** La recepcionista confirma una reserva pendiente.

```json
{
  "flow_steps": {
    "value": "- Paso 1: Selecciona la reserva.\n- Paso 2: Confirma.",
    "coverage": "complete",
    "rationale": "Flujo simple.",
    "updated_at": "2026-01-01T00:00:00+00:00"
  }
}
```

## §7 Grafo de relaciones

- `UC-001` --[covers]--> `FR-001`
- `UI-001` --[requires]--> `UC-001`
