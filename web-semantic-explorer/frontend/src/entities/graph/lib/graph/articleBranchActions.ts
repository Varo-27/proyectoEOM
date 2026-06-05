import type { Edge, XYPosition } from "@xyflow/react"

import type { ArticleDetail } from "@/entities/article"
import type { ArticleMetadataFilters } from "@/shared/lib/filters"
import type { AppNode, AppNodeData } from "@/entities/graph/model/types"

import { createDefaultQueryNode } from "@/entities/graph/model/createDefaultInputNode"
import { buildEdge } from "@/entities/graph/lib/edges/isValidGraphConnection"
import { createFilterNodeId, createInputNodeId } from "@/entities/graph/model/graphNodeIds"
import {
  FILTER_NODE_DIMENSIONS,
  type FilterNodeKind,
  GRAPH_NODE_TYPE,
} from "@/entities/graph/model/graphNodeTypes"
import { createFilterNodeAtPosition } from "@/entities/graph/model/createPaletteNode"

type ArticleMetadata = {
  authors?: string[]
  categories?: string[]
  places?: string[]
  author_name?: string
  category_name?: string
}

export type ArticleExpandFilterKind = "place" | "category" | "author"

export function pickFilterValueForKind(
  metadata: ArticleMetadata,
  kind: ArticleExpandFilterKind,
): string | null {
  if (kind === "place") {
    const place = metadata.places?.[0]?.trim()
    return place || null
  }

  if (kind === "category") {
    const category =
      metadata.categories?.[0]?.trim() ?? metadata.category_name?.trim()
    return category || null
  }

  const author = metadata.authors?.[0]?.trim() ?? metadata.author_name?.trim()
  return author || null
}

export function readArticleExpandFilters(
  data: AppNodeData,
): ArticleMetadataFilters {
  const raw = data.expandFilters
  if (!raw || typeof raw !== "object") {
    return {}
  }

  const filters: ArticleMetadataFilters = {}
  for (const key of ["place", "category", "author", "year_start", "year_end"] as const) {
    const value = raw[key]
    if (value === undefined || value === "") {
      continue
    }
    if (key === "year_start" || key === "year_end") {
      const parsed =
        typeof value === "number" ? value : Number.parseInt(String(value), 10)
      if (Number.isFinite(parsed)) {
        filters[key] = parsed
      }
      continue
    }
    const text = String(value).trim()
    if (text) {
      filters[key] = text
    }
  }
  return filters
}

export function setArticleExpandFilter(
  articleNode: AppNode,
  metadata: ArticleMetadata,
  kind: ArticleExpandFilterKind,
): AppNode | null {
  const value = pickFilterValueForKind(metadata, kind)
  if (!value) {
    return null
  }

  const current = readArticleExpandFilters(articleNode.data)
  return {
    ...articleNode,
    data: {
      ...articleNode.data,
      expandFilters: {
        ...current,
        [kind]: value,
      },
    },
  }
}

export function removeArticleExpandFilter(
  articleNode: AppNode,
  kind: keyof ArticleMetadataFilters,
): AppNode {
  const current = { ...readArticleExpandFilters(articleNode.data) }
  delete current[kind]

  const hasFilters = Object.keys(current).length > 0
  return {
    ...articleNode,
    data: {
      ...articleNode.data,
      expandFilters: hasFilters ? current : undefined,
    },
  }
}

export function createFilterFromArticleByKind(
  articleNode: AppNode,
  metadata: ArticleMetadata,
  kind: ArticleExpandFilterKind,
  offsetIndex = 0,
): { node: AppNode; edge: Edge } | null {
  const value = pickFilterValueForKind(metadata, kind)
  if (!value) {
    return null
  }

  const position: XYPosition = {
    x: articleNode.position.x - 40 + offsetIndex * 48,
    y: articleNode.position.y - 220,
  }

  const node = createFilterNodeAtPosition(kind, position)
  node.data.filterValue = value
  node.data.title = `${FILTER_NODE_DIMENSIONS[kind]}: ${value}`

  return {
    node,
    edge: buildEdge(node.id, articleNode.id),
  }
}

export function pickFilterFromArticle(
  metadata: ArticleMetadata,
): { key: FilterNodeKind; value: string } | null {
  const place = metadata.places?.[0]?.trim()
  if (place) {
    return { key: "place", value: place }
  }

  const category =
    metadata.categories?.[0]?.trim() ?? metadata.category_name?.trim()
  if (category) {
    return { key: "category", value: category }
  }

  const author = metadata.authors?.[0]?.trim() ?? metadata.author_name?.trim()
  if (author) {
    return { key: "author", value: author }
  }

  return null
}

export function createFilterFromArticleAtPosition(
  articleNode: AppNode,
  metadata: ArticleMetadata,
  offsetIndex = 0,
): { node: AppNode; edge: Edge } | null {
  const picked = pickFilterFromArticle(metadata)
  if (!picked) {
    return null
  }

  const position: XYPosition = {
    x: articleNode.position.x - 40 + offsetIndex * 48,
    y: articleNode.position.y - 220,
  }

  const node = createFilterNodeAtPosition(picked.key, position)
  node.data.filterValue = picked.value
  node.data.title = `${FILTER_NODE_DIMENSIONS[picked.key]}: ${picked.value}`

  return {
    node,
    edge: buildEdge(node.id, articleNode.id),
  }
}

export function createQueryBranchFromArticle(
  articleNode: AppNode,
  metadata: ArticleMetadata,
  queryText = "",
): { nodes: AppNode[]; edges: Edge[] } {
  const queryNode: AppNode = {
    ...createDefaultQueryNode(),
    id: createInputNodeId(),
    position: {
      x: articleNode.position.x - 180,
      y: articleNode.position.y - 360,
    },
    data: {
      title: queryText ? `Búsqueda: ${queryText}` : "Nueva búsqueda",
      query: queryText,
      appearDelay: 0,
    },
  }

  const picked = pickFilterFromArticle(metadata)
  const nodes: AppNode[] = [queryNode]
  const edges: Edge[] = []

  if (picked) {
    const filterNode: AppNode = {
      ...createFilterNodeAtPosition(picked.key, {
        x: articleNode.position.x - 40,
        y: articleNode.position.y - 180,
      }),
      id: createFilterNodeId(picked.key),
      data: {
        title: `${FILTER_NODE_DIMENSIONS[picked.key]}: ${picked.value}`,
        filterKey: picked.key,
        filterValue: picked.value,
        appearDelay: 0,
      },
    }
    nodes.push(filterNode)
    edges.push(buildEdge(queryNode.id, filterNode.id))
    edges.push(buildEdge(filterNode.id, articleNode.id))
  } else {
    edges.push(buildEdge(queryNode.id, articleNode.id))
  }

  return { nodes, edges }
}

export function articleDetailToMetadata(detail: ArticleDetail): ArticleMetadata {
  return {
    authors: detail.authors,
    categories: detail.categories,
    places: detail.places,
  }
}

export function articleNodeToMetadata(node: AppNode): ArticleMetadata {
  return {
    author_name: node.data.author_name,
    category_name: node.data.category_name,
  }
}

export function favoriteArticleToGraphNode(
  favorite: {
    article_id: number
    title: string | null
    excerpt: string | null
    image_url: string | null
    url: string
    authors: string[]
    categories: string[]
  },
  position: XYPosition,
): AppNode {
  return {
    id: String(favorite.article_id),
    type: GRAPH_NODE_TYPE.article,
    position,
    data: {
      title: favorite.title ?? "Artículo",
      excerpt: favorite.excerpt ?? undefined,
      url: favorite.url,
      imageUrl: favorite.image_url ?? undefined,
      author_name: favorite.authors.length
        ? favorite.authors.join(", ")
        : undefined,
      category_name: favorite.categories[0],
      appearDelay: 0,
    },
  }
}
