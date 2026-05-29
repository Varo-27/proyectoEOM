/**
 * Capa API del frontend.
 *
 * - `@/client` — servicios generados por openapi-ts (auth, search, graph…).
 * - `@/api/*` — clientes manuales y tipos de endpoints aún no en el OpenAPI.
 */
export { StatsApi } from "./stats"
export {
  expandGraphWithFilters,
  searchArticlesWithFilters,
} from "./searchWithFilters"
export { listAuthors } from "./taxonomy"
export type { AuthorOption, AuthorsListResponse } from "./taxonomy"
export {
  articleDetailQueryKey,
  createArticleComment,
  deleteComment,
  fetchArticleDetail,
  toggleArticleFavorite,
  updateComment,
  upsertArticleRating,
} from "./articles"
export type {
  ArticleComment,
  ArticleDetail,
  CommentRecord,
  FavoriteStatus,
  RatingSummary,
} from "./articles"
export type { HeatmapEntry, HeatmapResponse } from "./types/heatmap"
