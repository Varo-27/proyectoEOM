import {
  favoriteArticleToGraphNode,
  mergeGraphArticles,
  useGraphStore,
} from "@/entities/graph"
import { useWorkspaceStore } from "@/entities/workspace"
import type { FavoriteArticle } from "@/shared/api/workspaces"
import type { GraphSearchParams } from "@/shared/lib/filters"
import { filtersToSearchParams } from "@/shared/lib/filters"

type NavigateFn = (options: { to: string; search?: GraphSearchParams }) => void

export function addFavoriteToInvestigation(
  favorite: FavoriteArticle,
  target: "current" | "new",
  options: { isGuestMode: boolean; navigate: NavigateFn },
) {
  if (target === "new" && !options.isGuestMode) {
    const label = (favorite.title ?? "Artículo").slice(0, 48)
    useWorkspaceStore.getState().createWorkspace(`Favoritos · ${label}`)
  }

  const articleId = String(favorite.article_id)
  const { nodes, edges } = useGraphStore.getState()

  if (!nodes.some((node) => node.id === articleId)) {
    const centerX =
      nodes.reduce((sum, node) => sum + node.position.x, 0) /
        Math.max(nodes.length, 1) +
      320
    const centerY =
      nodes.reduce((sum, node) => sum + node.position.y, 0) /
      Math.max(nodes.length, 1)

    const newNode = favoriteArticleToGraphNode(favorite, {
      x: centerX,
      y: centerY,
    })
    const merged = mergeGraphArticles(nodes, edges, [newNode], [])
    useGraphStore.getState().setNodes(merged.nodes)
    useGraphStore.getState().setEdges(merged.edges)
  }

  useWorkspaceStore.getState().captureActiveWorkspace()

  void options.navigate({
    to: "/",
    search: filtersToSearchParams(
      {
        author: favorite.authors[0],
        category: favorite.categories[0],
        place: favorite.places[0],
      },
      favorite.title ?? undefined,
    ),
  })
}
