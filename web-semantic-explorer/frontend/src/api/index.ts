/**
 * Capa API del frontend.
 *
 * - `@/client` — servicios generados por openapi-ts (auth, search, graph…).
 * - `@/api/*` — clientes manuales y tipos de endpoints aún no en el OpenAPI.
 */
export { StatsApi } from "./stats"
export type { HeatmapEntry, HeatmapResponse } from "./types/heatmap"
