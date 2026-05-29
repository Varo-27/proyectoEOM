import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Handle, type NodeProps, Position } from "@xyflow/react"
import { Heart, Sparkles } from "lucide-react"

import {
  articleDetailQueryKey,
  fetchArticleDetail,
  toggleArticleFavorite,
  type ArticleDetail,
} from "@/api/articles"
import useCustomToast from "@/hooks/useCustomToast"
import { isLoggedIn } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import type { AppNode } from "@/store/useGraphStore"
import { useGraphStore } from "@/store/useGraphStore"

export function ArticleNode({ id, data }: NodeProps<AppNode>) {
  const activeNodeId = useGraphStore((state) => state.activeNodeId)
  const expandSimilar = useGraphStore((state) => state.expandSimilar)
  const isActive = activeNodeId === id
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const articleId = Number(id)
  const detailKey = articleDetailQueryKey(articleId)
  const loggedIn = isLoggedIn()

  const { data: detail } = useQuery<ArticleDetail>({
    queryKey: detailKey,
    queryFn: () => fetchArticleDetail(articleId),
    enabled: loggedIn && !Number.isNaN(articleId),
    staleTime: 60_000,
  })

  const favoriteMutation = useMutation({
    mutationFn: () => toggleArticleFavorite(articleId),
    onSuccess: (response) => {
      queryClient.setQueryData<ArticleDetail>(detailKey, (current) =>
        current
          ? { ...current, is_favorited: response.is_favorited }
          : current,
      )
      showSuccessToast(
        response.is_favorited ? "Añadido a favoritos" : "Quitado de favoritos",
      )
    },
    onError: () => showErrorToast("No se pudo actualizar el favorito"),
  })

  const isFavorited = detail?.is_favorited ?? false

  return (
    <div
      className={cn(
        "graph-node-enter graph-node-card group relative w-[300px] border-2 border-foreground bg-background shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-primary)]",
        isActive && "graph-node-active",
      )}
      style={{
        animationDelay: data.appearDelay ? `${data.appearDelay}ms` : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-background !border-2 !border-foreground"
      />
      <div className="flex flex-col bg-card">
        <div className="flex items-center justify-between gap-2 border-b-2 border-foreground bg-muted px-3 py-2">
          <span className="truncate text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
            {data.category_name || "Artículo"}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {loggedIn && (
              <button
                type="button"
                aria-label={
                  isFavorited ? "Quitar de favoritos" : "Añadir a favoritos"
                }
                aria-pressed={isFavorited}
                disabled={favoriteMutation.isPending}
                className={cn(
                  "nodrag nopan inline-flex items-center justify-center border border-foreground/30 p-1 transition-colors hover:border-foreground",
                  isFavorited && "bg-primary text-primary-foreground",
                )}
                onClick={(event) => {
                  event.stopPropagation()
                  favoriteMutation.mutate()
                }}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <Heart
                  className={cn(
                    "h-3.5 w-3.5",
                    isFavorited && "fill-current",
                  )}
                />
              </button>
            )}
            {data.author_name && (
              <span className="max-w-[120px] truncate text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                {data.author_name}
              </span>
            )}
          </div>
        </div>

        {data.imageUrl && (
          <div className="h-28 overflow-hidden border-b-2 border-foreground">
            <img
              src={data.imageUrl}
              alt={data.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-2 p-3">
          <h3 className="font-serif text-lg font-bold leading-snug text-pretty text-foreground">
            <span className="eom-title-highlight">{data.title}</span>
          </h3>
          {data.excerpt && (
            <p className="line-clamp-2 pl-2 text-xs leading-relaxed text-muted-foreground before:absolute relative before:left-0 before:top-0.5 before:bottom-0.5 before:w-0.5 before:bg-primary/25">
              {data.excerpt}
            </p>
          )}
        </div>

        <div className="border-t-2 border-foreground bg-muted/50 px-3 py-2">
          <button
            type="button"
            className="nodrag nopan inline-flex w-full items-center justify-center gap-1.5 border border-foreground/30 bg-background px-3 py-1.5 text-[10px] uppercase tracking-widest text-foreground transition-colors hover:border-foreground hover:bg-primary hover:text-primary-foreground"
            onClick={(event) => {
              event.stopPropagation()
              expandSimilar?.(id)
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Más como este
          </button>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-background !border-2 !border-foreground"
      />
    </div>
  )
}
