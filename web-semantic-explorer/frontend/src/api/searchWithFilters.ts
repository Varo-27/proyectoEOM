import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"
import type { ExpandResponse, SearchResponse } from "@/client/types.gen"
import {
  type ArticleMetadataFilters,
  filtersToApiQuery,
} from "@/lib/filters"

type ExpandGraphBody = {
  source_article_id: number
  existing_node_ids: number[]
  filters?: ArticleMetadataFilters
}

/** Búsqueda semántica con filtros de metadatos (OpenAPI aún sin params). */
export function searchArticlesWithFilters(
  q: string,
  limit: number,
  filters: ArticleMetadataFilters = {},
): CancelablePromise<SearchResponse> {
  return request(OpenAPI, {
    method: "GET",
    url: "/api/v1/search",
    query: {
      q,
      limit,
      ...filtersToApiQuery(filters),
    },
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
