# Contribuir

## Agregar o modificar una skill

1. Cada skill vive en `skills/<categoría>/<nombre>/SKILL.md`. El `name` del frontmatter debe ser igual al nombre de la carpeta y estar en kebab-case.
2. La `description` es lo que hace que el agente active la skill: qué hace, con qué entrada y cuándo usarla. Máximo 1024 caracteres.
3. Mantén `SKILL.md` corto: pasos con su **criterio de terminado**. El material de consulta va en `references/`, enlazado desde el paso que lo necesita.
4. Registra la skill en `.claude-plugin/plugin.json` → `skills`.
5. Si agregas scripts, que sean Node sin dependencias, con pruebas en `tests/`.

## Antes de abrir un PR

```bash
npm run test            # valida las skills y corre las pruebas
npx skills add . --list # confirma que el CLI de skills la descubre
npm run changeset       # describe el cambio
```

## Datos de clientes

No subas specs reales de clientes. Para pruebas, usa fixtures sintéticos en `tests/fixtures/`.
