/** Tipos de nodo React Flow del explorador semántico. */
export const GRAPH_NODE_TYPE = {
  article: "article",
  input: "input",
  filter: "filter",
  /** @deprecated Usar `input`. Se mantiene para workspaces guardados. */
  searchCenter: "searchCenter",
} as const

export type GraphNodeType =
  (typeof GRAPH_NODE_TYPE)[keyof typeof GRAPH_NODE_TYPE]

export type FilterNodeKind = keyof typeof FILTER_NODE_DIMENSIONS

/** Dimensiones de filtro disponibles en la paleta (una por nodo). */
export const FILTER_NODE_DIMENSIONS = {
  author: "Autor",
  category: "Categoría",
  place: "Lugar",
  year_start: "Desde (año)",
  year_end: "Hasta (año)",
} as const

export function isFilterNodeType(
  nodeType: string | undefined,
): nodeType is typeof GRAPH_NODE_TYPE.filter {
  return nodeType === GRAPH_NODE_TYPE.filter
}

export function isInputNodeType(
  nodeType: string | undefined,
): nodeType is typeof GRAPH_NODE_TYPE.input {
  return nodeType === GRAPH_NODE_TYPE.input
}

export function isArticleNodeType(
  nodeType: string | undefined,
): nodeType is typeof GRAPH_NODE_TYPE.article {
  return nodeType === GRAPH_NODE_TYPE.article
}
