import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Handle, type NodeProps, Position } from "@xyflow/react"
import { GitBranch, Heart, Sparkles } from "lucide-react"
import { memo } from "react"
import { toast } from "sonner"
import { useShallow } from "zustand/react/shallow"

import {
  type ArticleDetail,
  articleDetailQueryKey,
  fetchArticleDetail,
  toggleArticleFavorite,
} from "@/api/articles"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { cn } from "@/lib/utils"
import type { AppNode } from "@/store/useGraphStore"
import { useGraphStore } from "@/store/useGraphStore"

import {
  articleDetailToMetadata,
  articleNodeToMetadata,
  createFilterFromArticleByKind,
  createQueryBranchFromArticle,
} from "@/entities/graph"
import { ArticleAddFilterButton } from "./ArticleAddFilterButton"
import { NodeDeleteButton } from "./NodeDeleteButton"

function ArticleNodeComponent({ id, data }: NodeProps<AppNode>) {
  const {
    activeNodeId,
    expandSimilar,
    setSelectedNode,
    setModalOpen,
    setActiveNodeId,
    setNodes,
    setEdges,
  } = useGraphStore(
    useShallow((state) => ({
      activeNodeId: state.activeNodeId,
      expandSimilar: state.expandSimilar,
      setSelectedNode: state.setSelectedNode,
      setModalOpen: state.setModalOpen,
      setActiveNodeId: state.setActiveNodeId,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
    })),
  )
  const usesLinkedContext = data.hasLinkedDownstreamContext === true
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
    mutationFn: async (kind: "place" | "category") => {
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

      const created = createFilterFromArticleByKind(node, metadata, kind)
      if (!created) {
        const label = kind === "place" ? "lugar" : "categoría"
        toast.message("Sin metadatos", {
          description: `Este artículo no tiene ${label} en sus metadatos.`,
        })
        return
      }

      const { nodes, edges } = useGraphStore.getState()
      setNodes([...nodes, created.node])
      setEdges([...edges, created.edge])
      toast.success(
        kind === "place" ? "Filtro de lugar creado" : "Filtro de categoría creado",
      )
    },
    onError: () => showErrorToast("No se pudo crear el filtro"),
  })

  const branchMutation = useMutation({
    mutationFn: async () => {
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

      const { nodes, edges } = useGraphStore.getState()
      const branch = createQueryBranchFromArticle(node, metadata)
      setNodes([...nodes, ...branch.nodes])
      setEdges([...edges, ...branch.edges])
      toast.success("Rama query + filtro creada")
    },
    onError: () => showErrorToast("No se pudo crear la rama"),
  })

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
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              className="graph-node__btn-link nodrag nopan"
              onClick={(event) => {
                event.stopPropagation()
                branchMutation.mutate()
              }}
              onMouseDown={(event) => event.stopPropagation()}
              disabled={branchMutation.isPending}
            >
              <GitBranch className="graph-node__icon" />
              Rama
            </button>
            <button
              type="button"
              className="graph-node__btn-link nodrag nopan"
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
              Abrir detalle
            </button>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="rf-handle" />
    </div>
  )
}

export const ArticleNode = memo(ArticleNodeComponent)
