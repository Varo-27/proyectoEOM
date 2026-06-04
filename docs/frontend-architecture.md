# Arquitectura frontend (FSD pragmático)

Este documento describe la estructura objetivo del frontend de Web Semantic Explorer y las reglas de dependencia entre capas.

## Capas

```text
src/
├── app/              # Bootstrap, providers, routing
├── pages/            # Composición mínima por ruta
├── widgets/          # Bloques UI compuestos reutilizables
├── features/         # Acciones de usuario (hooks + UI pequeña)
├── entities/         # Modelos de dominio, lib pura, API por entidad
├── shared/           # Infraestructura sin lógica de negocio
└── store/            # Slices Zustand delgados
```

## Reglas de import

| Desde | Puede importar |
|-------|----------------|
| `shared/` | solo npm / `shared/` |
| `entities/` | `shared/` |
| `features/` | `entities/`, `shared/`, `store/` |
| `widgets/` | `features/`, `entities/`, `shared/`, `store/` |
| `pages/`, `app/` | capas superiores |
| `store/` | **`entities/` únicamente** (nunca `components/` ni `widgets/`) |
| `entities/*/api/` | `shared/api` (nunca `store/`) |

Verificación local:

```bash
cd web-semantic-explorer/frontend && npm run check:imports
```

## Mapa de migración

| Legacy | Destino |
|--------|---------|
| `store/graph/types.ts` | `entities/graph/model/types.ts` |
| `components/Graph/context/` | `entities/graph/lib/context/` |
| `components/Graph/subgraph/` | `entities/graph/lib/subgraph/` |
| `components/Graph/graph/` | `entities/graph/lib/graph/` |
| `components/Graph/edges/isValidGraphConnection.ts` | `entities/graph/lib/edges/` |
| `components/Graph/workspace/migrateGraphSnapshot.ts` | `entities/graph/lib/workspace/` |
| `api/articles.ts` | `entities/article/` + `entities/engagement/` |
| `store/workspace/types.ts` | `entities/workspace/model/types.ts` |
| `ArticleModalContent.tsx` | `widgets/article-modal/` + `features/article-*` |
| `GraphExplorer.tsx` | `widgets/graph-explorer/` |
| `components/ui/` | `shared/ui/` (re-export temporal en `@/components/ui`) |
| `lib/filters.ts`, `lib/utils.ts` | `shared/lib/` |
| Rutas `_layout/` | `pages/graph/`, `pages/map/` |

## Principios

1. **Extraer cuando hay frontera clara**, no crear slices vacíos.
2. **Lógica pura del grafo** vive en `entities/graph/lib/` con tests co-localizados.
3. **Engagement social**: API en `entities/engagement/`, UI en `features/article-*`.
4. **Zustand** solo orquesta estado; no contiene reglas de dominio.

## Referencias

- [Plan de implementación](./plan_de_implementacion.md)
- Skill FSD: `.agents/skills/feature-sliced-design/SKILL.md`
