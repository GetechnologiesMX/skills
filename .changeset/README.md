# Changesets

Cada cambio que altere el comportamiento de una skill lleva un changeset:

```bash
npm run changeset
```

Elige `patch` para correcciones, `minor` para capacidades nuevas y `major` para cambios que rompen el flujo de quien ya usa la skill. Al liberar, `npm run version` actualiza `package.json`, `.claude-plugin/plugin.json` y `CHANGELOG.md`.
