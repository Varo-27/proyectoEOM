import { useCallback } from "react"
import { toast } from "sonner"

import { expandGraphWithFilters } from "@/shared/api/searchWithFilters"
import {
  applySugiyamaLayout,
  dedupeEdgesById,
  EXPAND_SIMILAR_LIMIT,
  EXPAND_SIMILAR_THRESHOLD,
  getStaggerDelay,
  graphNodeToAppNode,
  mergeGraphArticles,
  readArticleExpandFilters,
  resolveExpandContext,
  revealGraphNodesStaggered,
  SEARCH_REVEAL_STAGGER_MS,
} from "@/entities/graph"
import type { AppNode } from "@/entities/graph"
import { useGraphStore } from "@/entities/graph"

type UseGraphExpandOptions = {
  setNodes: (nodes: AppNode[]) => void
  setLoading: (loading: boolean) => void
  centerViewportOnNode: (nodeId: string) => void
}

export function useGraphExpand({
  setNodes,
  setLoading,
  centerViewportOnNode,
}: UseGraphExpandOptions) {
  const expandSimilarFromNode = useCallback(
    async (node: AppNode) => {
      const sourceId = Number(node.id)
      if (!Number.isFinite(sourceId)) {
        return
      }

      const { nodes, edges } = useGraphStore.getState()
      const context = resolveExpandContext(node, nodes, edges)
      const inlineFilters = readArticleExpandFilters(node.data)
      const filters = { ...context.upstreamFilters, ...inlineFilters }

      const existingIds = nodes
        .map((currentNode) => Number(currentNode.id))
        .filter((id) => Number.isFinite(id))

      setLoading(true)

      try {
        const response = await expandGraphWithFilters(
          {
            source_article_id: sourceId,
            existing_node_ids: existingIds,
            filters,
            seed_queries: context.seedQueries,
            context_article_ids: context.contextArticleIds,
          },
          {
            limit: EXPAND_SIMILAR_LIMIT,
            threshold: EXPAND_SIMILAR_THRESHOLD,
          },
        )

        const newNodes = response.new_nodes.map((newNode, index) =>
          graphNodeToAppNode(
            newNode,
            { x: node.position.x, y: node.position.y },
            getStaggerDelay(index, 120, 80),
          ),
        )

        const newEdges = response.new_edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        }))

        const { nodes: mergedNodes, edges: mergedEdges } = mergeGraphArticles(
          nodes,
          edges,
          newNodes,
          newEdges,
        )

        const layoutedNodes = applySugiyamaLayout(mergedNodes, mergedEdges)
        const newNodeIds = new Set(newNodes.map((current) => current.id))

        const layoutedKeptNodes = layoutedNodes.filter(
          (current) => !newNodeIds.has(current.id),
        )
        const layoutedNewNodes = newNodes.map((incoming) => {
          const layouted = layoutedNodes.find(
            (candidate) => candidate.id === incoming.id,
          )
          return layouted ?? incoming
        })

        // Una arista por nodo nuevo para la animación; el backend devuelve además
        // aristas cruzadas new↔existing por similitud que no caben 1:1 en el stagger.
        const staggerEdges = layoutedNewNodes.map((incoming) => {
          const matched = newEdges.find((edge) => edge.target === incoming.id)
          return (
            matched ?? {
              id: `edge-${node.id}-${incoming.id}`,
              source: String(node.id),
              target: incoming.id,
            }
          )
        })

        await revealGraphNodesStaggered(
          layoutedKeptNodes,
          edges,
          layoutedNewNodes,
          staggerEdges,
          SEARCH_REVEAL_STAGGER_MS,
          (stepNodes, stepEdges) => {
            setNodes(stepNodes)
            useGraphStore.getState().setEdges(dedupeEdgesById(stepEdges))
          },
        )

        setNodes(
          layoutedNodes.map((current) => {
            if (current.data.appearDelay == null) {
              return current
            }
            const { appearDelay: _removed, ...data } = current.data
            return { ...current, data }
          }),
        )
        useGraphStore.getState().setEdges(dedupeEdgesById(mergedEdges))
        centerViewportOnNode(node.id)

        if (newNodes.length === 0) {
          toast.message("Sin artículos nuevos", {
            description:
              "Prueba otra semilla, relaja filtros o conecta un input con más contexto.",
          })
        }
      } catch (error) {
        console.error("Error expanding graph:", error)
        toast.error("No se pudo expandir", {
          description:
            error instanceof Error ? error.message : "Error desconocido",
        })
      } finally {
        setLoading(false)
      }
    },
    [centerViewportOnNode, setLoading, setNodes],
  )

  return { expandSimilarFromNode }
}
