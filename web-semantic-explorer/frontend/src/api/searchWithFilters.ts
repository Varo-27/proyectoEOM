import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"
import type { ExpandResponse, SearchResponse } from "@/client/types.gen"
import { type ArticleMetadataFilters, filtersToApiQuery } from "@/lib/filters"

type ExpandGraphBody = {
  source_article_id: number
  existing_node_ids: number[]
  filters?: ArticleMetadataFilters
  seed_queries?: string[]
  context_article_ids?: number[]
}

/** Búsqueda semántica con filtros de metadatos (OpenAPI aún sin params). */
type SearchContextOptions = {
  seedQueries?: string[]
  contextArticleIds?: number[]
}

export function searchArticlesWithFilters(
  q: string,
  limit: number,
  filters: ArticleMetadataFilters = {},
  context: SearchContextOptions = {},
): CancelablePromise<SearchResponse> {
  const query: Record<string, string | number | string[] | number[]> = {
    q,
    limit,
    ...filtersToApiQuery(filters),
  }

  const seeds = context.seedQueries?.filter((text) => text.trim()) ?? []
  if (seeds.length > 0) {
    query.seed_queries = seeds
  }

  const articleIds =
    context.contextArticleIds?.filter((id) => Number.isFinite(id)) ?? []
  if (articleIds.length > 0) {
    query.context_article_ids = articleIds
  }

  return request(OpenAPI, {
    method: "GET",
    url: "/api/v1/search",
    query,
  })
}

/** Expande el grafo incluyendo filtros opcionales en el body. */
export function expandGraphWithFilters(
  body: ExpandGraphBody,
  options: { limit?: number; threshold?: number } = {},
): CancelablePromise<ExpandResponse> {
  const { filters, ...requestBody } = body

  return request(OpenAPI, {
    method: "POST",
    url: "/api/v1/graph/expand",
    query: {
      limit: options.limit,
      threshold: options.threshold,
    },
    body: {
      ...requestBody,
      ...(hasFiltersPayload(filters) ? { filters } : {}),
    },
    mediaType: "application/json",
  })
}

function hasFiltersPayload(
  filters: ArticleMetadataFilters | undefined,
): filters is ArticleMetadataFilters {
  if (!filters) {
    return false
  }

  return Object.values(filters).some(
    (value) => value !== undefined && value !== "",
  )
}
