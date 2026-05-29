/**
 * Contratos de `/api/v1/stats/heatmap`.
 * Alineados con `backend/app/schemas/stats.py`.
 */

/** Lugar geográfico con recuento de artículos asociados. */
export type HeatmapEntry = {
  /** ID interno del lugar (ArticlePlace / Place). */
  place_id: number
  /** Nombre legible del lugar. */
  name: string
  /** Slug URL de El Orden Mundial; null si no aplica. */
  slug: string | null
  /** Código ISO 3166-1 alpha-3 del país principal; null si es región supranacional. */
  country_code: string | null
  /** Códigos ISO de países representados en el mapa (p. ej. regiones compuestas). */
  map_country_codes: string[]
  /** Número de artículos vinculados a este lugar. */
  article_count: number
}

/** Respuesta agregada del endpoint de mapa de calor. */
export type HeatmapResponse = {
  /** Total de artículos considerados en la agregación. */
  total_articles: number
  /** Entradas por lugar, ordenadas por volumen descendente en backend. */
  entries: HeatmapEntry[]
}
