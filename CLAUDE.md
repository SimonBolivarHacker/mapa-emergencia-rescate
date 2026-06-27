# CLAUDE.md

Instrucciones para Claude Code y agentes compatibles.

## Fuente de verdad

Lee `AGENTS.md` completo antes de editar. Este archivo solo agrega una lista de
arranque rápido para Claude; las reglas operativas, de seguridad y de PR viven
en `AGENTS.md`.

## Arranque rápido

1. Revisa `README.md`, `CONTRIBUTING.md`, `AGENTS.md` y el archivo que vas a
   modificar.
2. Si el cambio toca Next.js 16, consulta `node_modules/next/dist/docs/` antes
   de asumir APIs o convenciones.
3. Crea una rama basada en `main`; si trabajas desde fuera del repo principal,
   usa fork-first.
4. Protege datos humanitarios: no pegues información personal, coordenadas
   sensibles, capturas privadas, secretos ni dumps de base de datos en el chat,
   commits, issues o PRs.
5. Ejecuta `npm run lint` y `npm run build` cuando el cambio toque código. Para
   docs puras, revisa enlaces, ortografía técnica y coherencia con
   `docs/README.md`.

## Cuando termines

- Deja un resumen breve de lo que cambió.
- Enumera validaciones ejecutadas y cualquier validación pendiente.
- Enlaza la issue o explica por qué no aplica.
- Si detectas riesgo de seguridad o datos sensibles, sigue `SECURITY.md` y no
  abras una issue pública.
