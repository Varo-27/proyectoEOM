import { useCallback } from "react"
import { toast } from "sonner"

import {
  expandGraphWithFilters,
  searchArticlesWithFilters,
} from "@/api/searchWithFilters"
import {
  collectDownstreamArticleIds,
  dedupeEdgesById,
  isQueryNodeType,
  removeEdgesTouchingNodes,
  resolveExpandContext,
  resolveSearchContext,
} from "@/entities/graph"
import type { AppNode } from "@/store/useGraphStore"
import { useGraphStore } from "@/store/useGraphStore"

import {
  EXPAND_SIMILAR_LIMIT,
  EXPAND_SIMILAR_THRESHOLD,
  getStaggerDelay,
  SEARCH_ARTICLES_LIMIT,
  SEARCH_REVEAL_STAGGER_MS,
} from "./graphConstants"
import {
  createSearchEdges,
  createSearchResultNodesAround,
  graphNodeToAppNode,
  updateInputNodeQuery,
} from "./graphMappers"
import { applyTreeLayout } from "./graphLayout"
import { mergeGraphArticles } from "./mergeGraphArticles"
import { revealGraphNodesStaggered } from "./revealGraphNodesStaggered"

type GraphExplorerActionsDeps = {
  setNodes: (nodes: AppNode[]) => void
  setLoading: (loading: boolean) => void
  setActiveNodeId: (nodeId: string | null) => void
  setSelectedNode: (node: AppNode | null) => void
  setModalOpen: (open: boolean) => void
  centerViewportOnNode: (nodeId: string) => void
}

export function useGraphExplorerActions({
  setNodes,
  setLoading,
  setActiveNodeId,
  setSelectedNode,
  setModalOpen,
  centerViewportOnNode,
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

  return { expandSimilarFromNode, searchFromInputNode }
}
