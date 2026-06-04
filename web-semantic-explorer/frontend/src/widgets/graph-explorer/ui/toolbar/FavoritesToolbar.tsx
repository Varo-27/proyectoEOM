import { useMutation, useQuery } from "@tanstack/react-query"
import { Star } from "lucide-react"
import { toast } from "sonner"

import { fetchFavorites, type FavoriteArticle } from "@/api/workspaces"
import { Button } from "@/components/ui/button"
import { isLoggedIn } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { useGraphStore } from "@/store/useGraphStore"

import { favoriteArticleToGraphNode } from "@/entities/graph"
import { mergeGraphArticles } from "@/entities/graph"

type FavoritesToolbarProps = {
  disabled?: boolean
}

export function FavoritesToolbar({ disabled }: FavoritesToolbarProps) {
  const loggedIn = isLoggedIn()
  const setNodes = useGraphStore((state) => state.setNodes)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["favorites-toolbar"],
    queryFn: () => fetchFavorites(),
    enabled: loggedIn,
    staleTime: 30_000,
  })

  const injectMutation = useMutation({
    mutationFn: async (favorite: FavoriteArticle) => {
      const { nodes, edges } = useGraphStore.getState()
      const articleId = String(favorite.article_id)

      if (nodes.some((node) => node.id === articleId)) {
        toast.message("Ya está en el lienzo", {
          description: favorite.title ?? `Artículo ${articleId}`,
        })
        return
      }

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
      setNodes(merged.nodes)
      useGraphStore.getState().setEdges(merged.edges)

      toast.success("Artículo añadido al lienzo")
    },
  })

  if (!loggedIn) {
    return (
      <div className="graph-favorites">
        <h2 className="eom-heading-section">Favoritos</h2>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Inicia sesión para inyectar tus favoritos al grafo.
        </p>
      </div>
    )
  }

  return (
    <div className="graph-favorites">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-primary" />
        <h2 className="eom-heading-section">Favoritos</h2>
      </div>
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Añade artículos guardados al lienzo sin buscar de nuevo.
      </p>

      {isLoading && (
        <p className="text-xs text-muted-foreground">Cargando favoritos…</p>
      )}
      {isError && (
        <p className="text-xs text-destructive">No se pudieron cargar favoritos</p>
      )}

      <div className="graph-favorites__list max-h-48 overflow-y-auto">
        <ul className="flex flex-col gap-1.5 pr-2">
          {(data?.data ?? []).map((favorite) => (
            <li key={favorite.article_id}>
              <Button
                type="button"
                variant="outline"
                disabled={disabled || injectMutation.isPending}
                className={cn(
                  "h-auto w-full justify-start whitespace-normal px-2 py-2 text-left text-[11px]",
                )}
                onClick={() => injectMutation.mutate(favorite)}
              >
                <span className="line-clamp-2 font-medium">
                  {favorite.title ?? `Artículo ${favorite.article_id}`}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {!isLoading && !isError && (data?.count ?? 0) === 0 && (
        <p className="text-xs text-muted-foreground">Aún no tienes favoritos.</p>
      )}
    </div>
  )
}
