import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Handle, type NodeProps, Position } from "@xyflow/react"
import { FileText, Heart, Sparkles, X } from "lucide-react"
import { memo } from "react"
import { toast } from "sonner"
import { useShallow } from "zustand/react/shallow"

import {
  type ArticleDetail,
  articleDetailQueryKey,
  fetchArticleDetail,
} from "@/entities/article"
import { toggleArticleFavorite } from "@/entities/engagement"
import { isLoggedIn } from "@/shared/auth"
import useCustomToast from "@/shared/lib/useCustomToast"
import { cn } from "@/shared/lib/utils"
import type { ArticleMetadataFilters } from "@/shared/lib/filters"
import type { AppNode } from "@/entities/graph"
import {
  FILTER_NODE_DIMENSIONS,
  articleDetailToMetadata,
  articleNodeToMetadata,
  readArticleExpandFilters,
  removeArticleExpandFilter,
  setArticleExpandFilter,
  useGraphStore,
  type ArticleExpandFilterKind,
} from "@/entities/graph"
import { ArticleAddFilterButton } from "./ArticleAddFilterButton"
import { NodeDeleteButton } from "./NodeDeleteButton"

const EXPAND_FILTER_LABELS: Record<ArticleExpandFilterKind, string> = {
  place: "lugar",
  category: "categoría",
  author: "autor",
}

function ArticleNodeComponent({ id, data }: NodeProps<AppNode>) {
  const {
    activeNodeId,
    expandSimilar,
    setSelectedNode,
    setModalOpen,
    setActiveNodeId,
    setNodes,
  } = useGraphStore(
    useShallow((state) => ({
      activeNodeId: state.activeNodeId,
      expandSimilar: state.expandSimilar,
      setSelectedNode: state.setSelectedNode,
      setModalOpen: state.setModalOpen,
      setActiveNodeId: state.setActiveNodeId,
      setNodes: state.setNodes,
    })),
  )
  const usesLinkedContext = data.hasLinkedDownstreamContext === true
  const expandFilters = readArticleExpandFilters(data)
  const expandFilterEntries = (
    Object.entries(expandFilters) as [keyof ArticleMetadataFilters, string | number][]
  ).filter(([, value]) => value !== undefined && value !== "")
  const isActive = activeNodeId === id
  const visited = typeof data.visitedAt === "string"
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
        current ? { ...current, is_favorited: response.is_favorited } : current,
      )
      showSuccessToast(
        response.is_favorited ? "Añadido a favoritos" : "Quitado de favoritos",
      )
    },
    onError: () => showErrorToast("No se pudo actualizar el favorito"),
  })

  const addFilterMutation = useMutation({
    mutationFn: async (kind: ArticleExpandFilterKind) => {
      const node = useGraphStore.getState().nodes.find((candidate) => candidate.id === id)
      if (!node) {
        return
      }

      let metadata = articleNodeToMetadata(node)
      if (detail) {
        metadata = articleDetailToMetadata(detail)
      } else if (!Number.isNaN(articleId)) {
        const fetched = await fetchArticleDetail(articleId)
        metadata = articleDetailToMetadata(fetched)
      }

      const updated = setArticleExpandFilter(node, metadata, kind)
      if (!updated) {
        const label = EXPAND_FILTER_LABELS[kind]
        toast.message("Sin metadatos", {
          description: `Este artículo no tiene ${label} en sus metadatos.`,
        })
        return
      }

      const { nodes } = useGraphStore.getState()
      setNodes(nodes.map((candidate) => (candidate.id === id ? updated : candidate)))
      toast.success(`Filtro de ${EXPAND_FILTER_LABELS[kind]} añadido`)
    },
    onError: () => showErrorToast("No se pudo añadir el filtro"),
  })

  const removeExpandFilter = (kind: keyof ArticleMetadataFilters) => {
    const node = useGraphStore.getState().nodes.find((candidate) => candidate.id === id)
    if (!node) {
      return
    }
    const updated = removeArticleExpandFilter(node, kind)
    setNodes(
      useGraphStore
        .getState()
        .nodes.map((candidate) => (candidate.id === id ? updated : candidate)),
    )
  }

  const isFavorited = detail?.is_favorited ?? false
  const shouldEnterAnimate = typeof data.appearDelay === "number"

  return (
    <div
      className={cn(
        "graph-node graph-node--article",
        isActive && "graph-node-active",
        visited && "graph-node--visited",
      )}
      {...(shouldEnterAnimate ? { "data-enter-animate": true } : {})}
      style={
        shouldEnterAnimate
          ? { animationDelay: `${data.appearDelay}ms` }
          : undefined
      }
    >
      <Handle type="target" position={Position.Top} className="rf-handle" />
      <div className="graph-node__surface">
        <div className="graph-node__header">
          <span className="eom-label-primary truncate">
            {data.category_name || "Artículo"}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <NodeDeleteButton nodeId={id} ariaLabel="Eliminar artículo" />
            {loggedIn && (
              <button
                type="button"
                aria-label={
                  isFavorited ? "Quitar de favoritos" : "Añadir a favoritos"
                }
                aria-pressed={isFavorited}
                disabled={favoriteMutation.isPending}
                className={cn(
                  "graph-node__icon-btn nodrag nopan",
                  isFavorited && "graph-node__icon-btn--favorited",
                )}
                onClick={(event) => {
                  event.stopPropagation()
                  favoriteMutation.mutate()
                }}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <Heart
                  className={cn(
                    "graph-node__icon",
                    isFavorited && "fill-current",
                  )}
                />
              </button>
            )}
            {data.author_name && (
              <span className="eom-caption max-w-[120px] truncate text-right">
                {data.author_name}
              </span>
            )}
          </div>
        </div>

        {data.imageUrl && (
          <div className="graph-node__image">
            <img src={data.imageUrl} alt={data.title} />
          </div>
        )}

        <div className="graph-node__body">
          <h3 className="eom-title-serif">
            <span className="eom-title-highlight">{data.title}</span>
          </h3>
          {data.excerpt && (
            <p className="graph-node__excerpt">{data.excerpt}</p>
          )}
        </div>

        <div className="graph-node__footer">
          <button
            type="button"
            className="graph-node__btn-filter w-full nodrag nopan"
            onClick={(event) => {
              event.stopPropagation()
              const node = useGraphStore
                .getState()
                .nodes.find((candidate) => candidate.id === id)
              if (!node) {
                return
              }
              setActiveNodeId(id)
              setSelectedNode(node)
              setModalOpen(true)
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <FileText className="graph-node__icon" />
            Abrir detalle
          </button>
          <div className="graph-node__footer-actions">
            <button
              type="button"
              className="graph-node__btn-primary graph-node__btn-primary--expand nodrag nopan"
              onClick={(event) => {
                event.stopPropagation()
                expandSimilar?.(id)
              }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Sparkles className="graph-node__icon" />
              {usesLinkedContext ? "Ver más (contexto enlazado)" : "Ver más"}
            </button>
            <ArticleAddFilterButton
              articleId={id}
              disabled={addFilterMutation.isPending}
              onAddFilter={(kind) => addFilterMutation.mutate(kind)}
            />
          </div>
          {expandFilterEntries.length > 0 && (
            <ul className="graph-node__expand-filters nodrag nopan" aria-label="Filtros para Ver más">
              {expandFilterEntries.map(([kind, value]) => (
                <li key={kind} className="graph-node__expand-filter">
                  <span className="graph-node__expand-filter-label">
                    {FILTER_NODE_DIMENSIONS[kind as keyof typeof FILTER_NODE_DIMENSIONS] ??
                      kind}
                    :
                  </span>
                  <span className="graph-node__expand-filter-value">{value}</span>
                  <button
                    type="button"
                    aria-label={`Quitar filtro ${kind}`}
                    className="graph-node__expand-filter-remove nodrag nopan"
                    onClick={(event) => {
                      event.stopPropagation()
                      removeExpandFilter(kind)
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <X className="graph-node__icon" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="rf-handle" />
    </div>
  )
}

export const ArticleNode = memo(ArticleNodeComponent)
