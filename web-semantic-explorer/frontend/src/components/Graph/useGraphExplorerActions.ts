import { useCallback } from "react"
import { toast } from "sonner"

import {
  expandGraphWithFilters,
  searchArticlesWithFilters,
} from "@/api/searchWithFilters"
import type { AppNode } from "@/store/useGraphStore"
import { useGraphStore } from "@/store/useGraphStore"

import { resolveExpandContext } from "./context/resolveExpandContext"
import { resolveSearchContext } from "./context/resolveSearchContext"
import {
  EXPAND_SIMILAR_LIMIT,
  EXPAND_SIMILAR_THRESHOLD,
  getStaggerDelay,
  SEARCH_ARTICLES_LIMIT,
} from "./graphConstants"
import {
  createSearchEdges,
  createSearchResultNodesAround,
  dedupeEdgesById,
  graphNodeToAppNode,
  updateInputNodeQuery,
} from "./graphMappers"
import { GRAPH_NODE_TYPE } from "./graphNodeTypes"
import { mergeGraphArticles } from "./mergeGraphArticles"
import {
  collectDownstreamArticleIds,
  removeEdgesTouchingNodes,
} from "./subgraph/collectDownstreamArticleIds"

type GraphExplorerActionsDeps = {
  setNodes: (nodes: AppNode[]) => void
  setLoading: (loading: boolean) => void
  setActiveNodeId: (nodeId: string | null) => void
  setSelectedNode: (node: AppNode | null) => void
  setModalOpen: (open: boolean) => void
}

export function useGraphExplorerActions({
  setNodes,
  setLoading,
  setActiveNodeId,
  setSelectedNode,
  setModalOpen,
}: GraphExplorerActionsDeps) {
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
            {
              x: node.position.x + (index - 2) * 40,
              y: node.position.y + 120 + index * 30,
            },
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

        setNodes(mergedNodes)
        useGraphStore.getState().setEdges(mergedEdges)

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
    [setLoading, setNodes],
  )

  const searchFromInputNode = useCallback(
    async (inputNodeId: string, query: string) => {
      const state = useGraphStore.getState()
      const currentNodes = state.nodes
      const currentEdges = state.edges
      const inputNode = currentNodes.find((node) => node.id === inputNodeId)

      if (!inputNode || inputNode.type !== GRAPH_NODE_TYPE.input) {
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

        const resultNodes = createSearchResultNodesAround(
          response.results,
          inputNode.position,
        )
        const newEdges = createSearchEdges(response.results, inputNodeId)

        const { nodes: mergedNodes, edges: mergedEdges } = mergeGraphArticles(
          keptNodes,
          keptEdges,
          resultNodes,
          newEdges,
        )

        setNodes(mergedNodes)
        useGraphStore.getState().setEdges(dedupeEdgesById(mergedEdges))
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
    [setActiveNodeId, setLoading, setModalOpen, setNodes, setSelectedNode],
  )

  return { expandSimilarFromNode, searchFromInputNode }
}
