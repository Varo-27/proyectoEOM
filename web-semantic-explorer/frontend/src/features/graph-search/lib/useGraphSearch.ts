import { useCallback } from "react"
import { toast } from "sonner"

import { searchArticlesWithFilters } from "@/api/searchWithFilters"
import {
  collectDownstreamArticleIds,
  createSearchEdges,
  createSearchResultNodesAround,
  dedupeEdgesById,
  isQueryNodeType,
  mergeGraphArticles,
  removeEdgesTouchingNodes,
  resolveSearchContext,
  revealGraphNodesStaggered,
  SEARCH_ARTICLES_LIMIT,
  SEARCH_REVEAL_STAGGER_MS,
  updateInputNodeQuery,
  applyTreeLayout,
} from "@/entities/graph"
import type { AppNode } from "@/store/useGraphStore"
import { useGraphStore } from "@/store/useGraphStore"

type UseGraphSearchOptions = {
  setNodes: (nodes: AppNode[]) => void
  setLoading: (loading: boolean) => void
  setActiveNodeId: (nodeId: string | null) => void
  setSelectedNode: (node: AppNode | null) => void
  setModalOpen: (open: boolean) => void
  centerViewportOnNode: (nodeId: string) => void
}

export function useGraphSearch({
  setNodes,
  setLoading,
  setActiveNodeId,
  setSelectedNode,
  setModalOpen,
  centerViewportOnNode,
}: UseGraphSearchOptions) {
  const searchFromInputNode = useCallback(
    async (inputNodeId: string, query: string) => {
      const state = useGraphStore.getState()
      const currentNodes = state.nodes
      const currentEdges = state.edges
      const inputNode = currentNodes.find((node) => node.id === inputNodeId)

      if (!inputNode || !isQueryNodeType(inputNode.type)) {
        return
      }

      const searchContext = resolveSearchContext(
        inputNodeId,
        currentNodes,
        currentEdges,
      )

      const articleIdsToRemove = collectDownstreamArticleIds(
        inputNodeId,
        currentNodes,
        currentEdges,
      )

      const keptNodes = currentNodes
        .filter((node) => !articleIdsToRemove.has(node.id))
        .map((node) =>
          node.id === inputNodeId ? updateInputNodeQuery(node, query) : node,
        )

      const keptEdges = removeEdgesTouchingNodes(
        currentEdges,
        articleIdsToRemove,
      )

      setLoading(true)
      setActiveNodeId(null)
      setSelectedNode(null)
      setModalOpen(false)

      try {
        const response = await searchArticlesWithFilters(
          query,
          SEARCH_ARTICLES_LIMIT,
          searchContext.filters,
          {
            seedQueries: searchContext.seedQueries,
            contextArticleIds: searchContext.contextArticleIds,
          },
        )

        const resultNodesRaw = createSearchResultNodesAround(
          response.results,
          inputNode.position,
        )

        const newEdges = createSearchEdges(response.results, inputNodeId)
        const mergedForLayout = [...keptNodes, ...resultNodesRaw]
        const mergedEdgesForLayout = dedupeEdgesById([...keptEdges, ...newEdges])
        const layoutedNodes = applyTreeLayout(
          mergedForLayout,
          mergedEdgesForLayout,
        )

        const layoutedKeptNodes = keptNodes.map((node) => {
          const layouted = layoutedNodes.find(
            (candidate) => candidate.id === node.id,
          )
          return layouted ?? node
        })

        const layoutedResultNodes = resultNodesRaw.map((node) => {
          const layouted = layoutedNodes.find(
            (candidate) => candidate.id === node.id,
          )
          return {
            ...(layouted ?? node),
            data: {
              ...(layouted ?? node).data,
              appearDelay: 0,
            },
          }
        })

        await revealGraphNodesStaggered(
          layoutedKeptNodes,
          keptEdges,
          layoutedResultNodes,
          newEdges,
          SEARCH_REVEAL_STAGGER_MS,
          (nodes, edges) => {
            setNodes(nodes)
            useGraphStore.getState().setEdges(dedupeEdgesById(edges))
          },
        )

        const { nodes: finalNodes } = useGraphStore.getState()
        setNodes(
          finalNodes.map((node) => {
            if (node.data.appearDelay == null) {
              return node
            }
            const { appearDelay: _removed, ...data } = node.data
            return { ...node, data }
          }),
        )
        centerViewportOnNode(inputNodeId)
      } catch (error) {
        console.error("Error en búsqueda desde input:", error)
        toast.error("No se pudo buscar", {
          description:
            error instanceof Error ? error.message : "Error desconocido",
        })
      } finally {
        setLoading(false)
      }
    },
    [
      centerViewportOnNode,
      setActiveNodeId,
      setLoading,
      setModalOpen,
      setNodes,
      setSelectedNode,
    ],
  )

  return { searchFromInputNode }
}
