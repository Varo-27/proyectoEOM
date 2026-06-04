import { useCallback } from "react"
import { toast } from "sonner"

import { expandGraphWithFilters } from "@/api/searchWithFilters"
import {
  applyTreeLayout,
  EXPAND_SIMILAR_LIMIT,
  EXPAND_SIMILAR_THRESHOLD,
  getStaggerDelay,
  graphNodeToAppNode,
  mergeGraphArticles,
  resolveExpandContext,
} from "@/entities/graph"
import type { AppNode } from "@/store/useGraphStore"
import { useGraphStore } from "@/store/useGraphStore"

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
      const filters = context.upstreamFilters

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

        const layoutedNodes = applyTreeLayout(mergedNodes, mergedEdges)

        setNodes(layoutedNodes)
        useGraphStore.getState().setEdges(mergedEdges)
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
