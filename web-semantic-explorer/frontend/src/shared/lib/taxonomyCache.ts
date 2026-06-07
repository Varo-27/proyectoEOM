/** Taxonomía estable (autores, categorías): pocos valores, cambian poco. */
export const TAXONOMY_STALE_TIME_MS = 1000 * 60 * 30
export const TAXONOMY_GC_TIME_MS = 1000 * 60 * 60 * 24

const STORAGE_PREFIX = "taxonomy-cache:"

export const taxonomyQueryKeys = {
  authors: ["taxonomy", "authors"] as const,
  categories: ["taxonomy", "categories"] as const,
}

export function readTaxonomyCache<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (!raw) {
      return undefined
    }
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

export function writeTaxonomyCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data))
  } catch {
    // QuotaExceeded u otros errores de almacenamiento: ignorar.
  }
}
