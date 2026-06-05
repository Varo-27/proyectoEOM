import type { Edge } from "@xyflow/react"

import type { ArticleSearchResult, GraphNode } from "@/client"
import type { AppNode, AppNodeData } from "@/entities/graph/model/types"

import {
  DEFAULT_ARTICLE_TITLE,
  getStaggerDelay,
  SEARCH_ROOT_ID,
  GRAPH_LAYOUT_SUGIYAMA,
} from "./graphConstants"

export function articleToNodeData(
  article: ArticleSearchResult,
  appearDelay: number,
): AppNodeData {
  return {
    title: article.title || DEFAULT_ARTICLE_TITLE,
    excerpt: article.excerpt || undefined,
    url: article.url,
    imageUrl: article.image_url || undefined,
    author_name: article.authors?.length
      ? article.authors.join(", ")
      : undefined,
    appearDelay,
  }
}

export function graphNodeToAppNode(
  graphNode: GraphNode,
  position: { x: number; y: number },
  appearDelay: number,
): AppNode {
  return {
    id: graphNode.id,
    type: "article",
    position,
    data: articleToNodeData(graphNode.data, appearDelay),
  }
}

export function createSearchRootNode(query: string): AppNode {
  const { defaultCenterOffsetX, defaultCenterOffsetY } = GRAPH_LAYOUT_SUGIYAMA

  return {
    id: SEARCH_ROOT_ID,
    type: "searchCenter",
    position: {
      x: window.innerWidth / 2 - defaultCenterOffsetX,
      y: window.innerHeight / 2 - defaultCenterOffsetY,
    },
    data: {
      title: `Búsqueda: ${query}`,
      appearDelay: 0,
    },
  }
}

export function createSearchResultNodes(
  results: ArticleSearchResult[],
): AppNode[] {
  return results.map((article, index) => ({
    id: String(article.id),
    type: "article",
    position: { x: 0, y: 0 },
    data: articleToNodeData(article, getStaggerDelay(index, 160, 90)),
  }))
}

export function createSearchEdges(
  results: ArticleSearchResult[],
  sourceNodeId: string,
): Edge[] {
  return results.map((article) => ({
    id: `edge-${sourceNodeId}-${article.id}`,
    source: sourceNodeId,
    target: String(article.id),
  }))
}

export function updateInputNodeQuery(
  inputNode: AppNode,
  query: string,
): AppNode {
  return {
    ...inputNode,
    data: {
      ...inputNode.data,
      query,
      title: `Búsqueda: ${query}`,
    },
  }
}

export { dedupeEdgesById } from "@/entities/graph/lib/mappers/dedupeEdges"
