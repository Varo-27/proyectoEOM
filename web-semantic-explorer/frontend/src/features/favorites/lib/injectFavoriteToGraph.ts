import type { XYPosition } from "@xyflow/react"
import {
  favoriteArticleToGraphNode,
  mergeGraphArticles,
  useGraphStore,
} from "@/entities/graph"
import type { FavoriteArticle } from "@/shared/api/workspaces"

type FavoriteGraphPayload = Pick<
  FavoriteArticle,
  | "article_id"
  | "title"
  | "excerpt"
  | "image_url"
  | "url"
  | "authors"
  | "categories"
>

export function defaultFavoriteInjectPosition(): XYPosition {
  const { nodes } = useGraphStore.getState()

  return {
    x:
      nodes.reduce((sum, node) => sum + node.position.x, 0) /
        Math.max(nodes.length, 1) +
      320,
    y:
      nodes.reduce((sum, node) => sum + node.position.y, 0) /
      Math.max(nodes.length, 1),
  }
}

export function injectFavoriteToGraph(
  favorite: FavoriteGraphPayload,
  position: XYPosition,
): boolean {
  const { nodes, edges } = useGraphStore.getState()
  const articleId = String(favorite.article_id)

  if (nodes.some((node) => node.id === articleId)) {
    return false
  }

  const newNode = favoriteArticleToGraphNode(favorite, position)
  const merged = mergeGraphArticles(nodes, edges, [newNode], [])
  useGraphStore.getState().setNodes(merged.nodes)
  useGraphStore.getState().setEdges(merged.edges)

  return true
}
