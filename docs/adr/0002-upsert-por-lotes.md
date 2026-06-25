# ADR 0002 — Upsert por lotes (batched)

> Estado: aceptada · Relacionado: [RFC 0001](../rfcs/0001-sincronizacion-fuentes.md)

## Contexto

La fuente más grande tiene ~43.700 registros y crece. El motor inicial (fase 1)
hace un upsert **por registro** (una llamada SQL por persona).

Medición real de la latencia del driver HTTP de Neon (solo-lectura, round-trip
secuencial): **~123 ms/llamada**. Por lo tanto:

| Estrategia | Llamadas | Tiempo estimado |
| --- | --- | --- |
| Uno por uno (actual) | 43.700 | **~90 min** ❌ (excede cualquier límite serverless) |
| Lotes de 500 | ~88 | **~11 s** ✅ |

## Decisión

Implementar `upsertExternalMissingBatch(people)` con **INSERT multi-fila +
`ON CONFLICT (source, external_id)`**, en lotes de **500** filas.

Reglas (validadas en Postgres local):

- **Deduplicar por `(source, external_id)` dentro de cada lote**, quedándose con
  el último. Postgres falla si una misma clave aparece dos veces en el mismo
  `INSERT ... ON CONFLICT` (`command cannot affect row a second time`). El feed
  vivo + paginación por offset produce solapes, así que esto es obligatorio.
- **Presupuesto de parámetros**: 14 columnas × 500 filas = 7.000 parámetros, muy
  por debajo del tope de Postgres (65.535). No subir el lote por encima de ~4.600
  filas.
- `RETURNING (xmax = 0) AS inserted` para contar insertados vs actualizados.
- Un lote que falla cuenta como error y **no** tumba el resto de la corrida.

## Consecuencias

- ✅ Un sync completo pasa de ~90 min a segundos: viable en serverless.
- ✅ Validado local: 2.000 filas en lotes de 500 → correcto; re-run = 0 inserts /
  2.000 updates; 0 grupos duplicados.
- ⚠️ El cuello de botella restante deja de ser la DB y pasa a ser **traer las
  ~437 páginas** de la API (ver fase de ejecución por chunks en el RFC).
