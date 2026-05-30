export type ArticleMetadataFilters = {
  place?: string
  category?: string
  author?: string
  year_start?: number
  year_end?: number
}

export type GraphSearchParams = {
  q?: string
  place?: string
  category?: string
  author?: string
  year_start?: string | number
  year_end?: string | number
}

const FILTER_KEYS: (keyof ArticleMetadataFilters)[] = [
  "place",
  "category",
  "author",
  "year_start",
  "year_end",
]

export function emptyFilters(): ArticleMetadataFilters {
  return {}
}

export function hasActiveFilters(filters: ArticleMetadataFilters): boolean {
  return FILTER_KEYS.some((key) => {
    const value = filters[key]
    return value !== undefined && value !== ""
  })
}

export function filtersToApiQuery(
  filters: ArticleMetadataFilters = {},
): Record<string, string | number> {
  const query: Record<string, string | number> = {}

  if (filters.place?.trim()) {
    query.place = filters.place.trim()
  }
  if (filters.category?.trim()) {
    query.category = filters.category.trim()
  }
  if (filters.author?.trim()) {
    query.author = filters.author.trim()
  }
  if (filters.year_start !== undefined) {
    query.year_start = filters.year_start
  }
  if (filters.year_end !== undefined) {
    query.year_end = filters.year_end
  }

  return query
}

export function filtersToSearchParams(
  filters: ArticleMetadataFilters,
  q?: string,
): GraphSearchParams {
  const params: GraphSearchParams = {}

  if (q?.trim()) {
    params.q = q.trim()
  }
  if (filters.place?.trim()) {
    params.place = filters.place.trim()
  }
  if (filters.category?.trim()) {
    params.category = filters.category.trim()
  }
  if (filters.author?.trim()) {
    params.author = filters.author.trim()
  }
  if (filters.year_start !== undefined) {
    params.year_start = String(filters.year_start)
  }
  if (filters.year_end !== undefined) {
    params.year_end = String(filters.year_end)
  }

  return params
}

export function searchParamsToFilters(
  params: GraphSearchParams = {},
): ArticleMetadataFilters {
  const filters: ArticleMetadataFilters = {}

  if (params.place?.trim()) {
    filters.place = params.place.trim()
  }
  if (params.category?.trim()) {
    filters.category = params.category.trim()
  }
  if (params.author?.trim()) {
    filters.author = params.author.trim()
  }

  const yearStart = parseYearParam(params.year_start)
  if (yearStart !== undefined) {
    filters.year_start = yearStart
  }

  const yearEnd = parseYearParam(params.year_end)
  if (yearEnd !== undefined) {
    filters.year_end = yearEnd
  }

  return filters
}

function parseYearParam(
  value: string | number | undefined,
): number | undefined {
  if (value === undefined || value === "") {
    return undefined
  }

  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const FILTER_LABELS: Record<keyof ArticleMetadataFilters, string> = {
  place: "Lugar",
  category: "Categoría",
  author: "Autor",
  year_start: "Desde",
  year_end: "Hasta",
}

export function formatFilterValue(
  key: keyof ArticleMetadataFilters,
  value: string | number,
): string {
  if (key === "year_start" || key === "year_end") {
    return String(value)
  }
  return String(value)
}
