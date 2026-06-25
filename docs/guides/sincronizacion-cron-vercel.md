# Guía: desplegar la sincronización con Vercel Cron

Cómo dejar corriendo la sincronización automática de fuentes en Vercel.
Ver el diseño en [RFC 0001](../rfcs/0001-sincronizacion-fuentes.md).

## Qué hace

`vercel.json` define dos crons:

| Cron | Endpoint | Frecuencia | Qué hace |
| --- | --- | --- | --- |
| Sync | `/api/sync/cron` | `*/10 * * * *` | Procesa un chunk de páginas (reanuda vía cursor). Varias corridas completan el ciclo. |
| Geocode | `/api/sync/geocode` | `*/5 * * * *` | Geocodifica un lote de ubicaciones sin coordenadas. |

Ambos son **idempotentes**: reintentar no duplica.

## Requisitos de plan

Los crons sub-diarios (`*/5`, `*/10`) requieren un plan **Vercel Pro o superior**.
El plan Hobby solo permite **un cron diario**. Confirma el plan antes de desplegar.

`maxDuration = 300` (5 min) en los endpoints también requiere Pro.

## Variables de entorno (Project → Settings → Environment Variables)

| Variable | Obligatoria | Para qué |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Neon Postgres (se inyecta sola si conectas Neon desde Vercel). |
| `CRON_SECRET` | ✅ (para el cron) | **Vercel manda `Authorization: Bearer $CRON_SECRET` a los crons SOLO si esta variable existe.** Sin ella, el cron llama sin auth → el endpoint responde 401 y no sincroniza. Pon un valor aleatorio largo. |
| `ADMIN_PASSWORD` | ✅ (para el panel) | Disparo manual (`/api/sync/run`) y panel admin. |
| `SYNC_SOURCES` | opcional | CSV de fuentes habilitadas. Si no se define, todas. |
| `SYNC_USER_AGENT` | opcional | User-Agent identificable hacia las fuentes. |
| `SOURCE_DESAPARECIDOS_URL` | opcional | Override del endpoint de la fuente. |
| `SOURCE_DESAPARECIDOS_IMPORT_CONTACT` | opcional | `true` para importar teléfonos (default `false`, ver RFC §6). |

> ⚠️ `CRON_SECRET` es el error #1 al desplegar. Si los crons devuelven 401 en los
> logs, casi siempre es que falta esa variable.

## Pasos

1. Conecta **Neon** al proyecto (Storage → Neon) → inyecta `DATABASE_URL`.
2. Define `CRON_SECRET` y `ADMIN_PASSWORD` en Environment Variables.
3. Despliega (`vercel --prod` o push a la rama de producción). Vercel detecta
   `vercel.json` y registra los crons.
4. Verifica en **Project → Crons**: deben aparecer los dos, con su próxima
   ejecución.

## Verificar que funciona

- **Logs**: Project → Logs, filtra por `/api/sync/cron`. Debe responder `200` con
  `{ ok: true, totals: {...} }`. Un `401` = falta `CRON_SECRET`.
- **Panel admin** (`/admin`): la sección "Sincronización de fuentes" muestra el
  cursor por fuente y las últimas corridas (tabla `sync_runs`).
- **Disparo manual**: en el panel, botón "Sincronizar ahora"
  (`POST /api/sync/run?mode=chunk` con el token admin) — útil para forzar sin
  esperar al cron.
- **Mapa**: tras unos ciclos de geocode, los registros sincronizados aparecen
  como marcadores.

## Tiempos esperados

- Fuente actual ~46k registros (~462 páginas). Cada cron de sync procesa ~50
  páginas (~25 s) → un ciclo completo en ~5 corridas (~50 min con `*/10`).
- El geocode respeta el ~1 req/s de Nominatim; va acotado por corrida y avanza
  ciclo a ciclo.

## Alternativas sin Vercel Cron

El endpoint acepta `Authorization: Bearer $CRON_SECRET` de cualquier llamador, así
que también sirve: GitHub Actions (`on: schedule`), Upstash QStash, cron-job.org,
o un worker con cron del sistema. Ver el RFC para detalles.
