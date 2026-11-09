# AGENTS.md

Repositorio de skills de GETechnologies, distribuido con `npx skills add GetechnologiesMX/skills` y como plugin de Claude Code (`.claude-plugin/`).

- Las skills están en `skills/<categoría>/<nombre>/`. Para crear o editar una, aplica la skill `writing-for-agents` si está disponible y sigue `CONTRIBUTING.md`.
- `npm run test` debe pasar antes de dar cualquier cambio por terminado.
- Cualquier versión nueva va con un changeset. Nunca edites a mano la versión en `package.json` ni en `plugin.json`.
- Los fixtures de `tests/fixtures/` son sintéticos. Las specs reales de clientes nunca entran al repo.
