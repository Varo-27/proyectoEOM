import { useQuery } from "@tanstack/react-query"

import {
  listAuthors,
  listCategories,
  type AuthorsListResponse,
  type CategoriesListResponse,
} from "@/shared/api/taxonomy"

import {
  readTaxonomyCache,
  TAXONOMY_GC_TIME_MS,
  TAXONOMY_STALE_TIME_MS,
  taxonomyQueryKeys,
  writeTaxonomyCache,
} from "./taxonomyCache"

function useTaxonomyQuery<T>(
  cacheKey: string,
  queryKey: readonly string[],
  queryFn: () => Promise<T>,
) {
  const cached = readTaxonomyCache<T>(cacheKey)

  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await queryFn()
      writeTaxonomyCache(cacheKey, data)
      return data
    },
    initialData: cached,
    initialDataUpdatedAt: cached ? 0 : undefined,
    staleTime: TAXONOMY_STALE_TIME_MS,
    gcTime: TAXONOMY_GC_TIME_MS,
  })
}

export function useAuthorsTaxonomy() {
  return useTaxonomyQuery<AuthorsListResponse>(
    "authors",
    taxonomyQueryKeys.authors,
    listAuthors,
  )
}

export function useCategoriesTaxonomy() {
  return useTaxonomyQuery<CategoriesListResponse>(
    "categories",
    taxonomyQueryKeys.categories,
    listCategories,
  )
}
