/** Identificador del nodo central de una búsqueda semilla. */
export const SEARCH_ROOT_ID = "search-root"

export const GRAPH_MIN_ZOOM = 0.12
export const GRAPH_MAX_ZOOM = 2

export const GRAPH_FIT_VIEW_OPTIONS = {
  padding: 0.35,
  maxZoom: 0.72,
  minZoom: GRAPH_MIN_ZOOM,
} as const

/** Grid del fondo React Flow (verde EOM al 25 % de opacidad). */
export const GRAPH_BACKGROUND_GRID_COLOR = "#497d0b40"

export const GRAPH_BACKGROUND_PROPS = {
  gap: 150,
  size: 10,
} as const

export const GRAPH_LAYOUT_TREE = {
  nodeWidth: 300,
  nodeHeight: 220,
  horizontalGap: 140,
  verticalGap: 220,
  offsetY: 140,
} as const

/** Distribución radial inicial de resultados antes del layout en árbol. */
export const GRAPH_SEARCH_RADIAL = {
  radius: 560,
  spread: Math.PI / 1.3,
  baseAngle: Math.PI / 2,
  centerOffsetX: 140,
  centerOffsetY: 40,
  articleOffsetX: 160,
  articleOffsetY: 60,
} as const

export const EXPAND_SIMILAR_LIMIT = 5
export const EXPAND_SIMILAR_THRESHOLD = 0.85
export const SEARCH_ARTICLES_LIMIT = 5

export const DEFAULT_ARTICLE_TITLE = "Sin título"

export const getStaggerDelay = (index: number, base = 140, step = 90) => {
  const jitter = Math.floor(Math.random() * 35)
  return base + index * step + jitter
}
