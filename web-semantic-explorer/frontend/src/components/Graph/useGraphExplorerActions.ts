import type { Edge } from "@xyflow/react"
import { useCallback } from "react"

import { GraphService, SearchService } from "@/client"
import type { AppNode } from "@/store/useGraphStore"

import {
    EXPAND_SIMILAR_LIMIT,
    EXPAND_SIMILAR_THRESHOLD,
    getStaggerDelay,
    SEARCH_ARTICLES_LIMIT,
} from "./graphConstants"
import { applyTreeLayout } from "./graphLayout"
import {
    createSearchEdges,
    createSearchResultNodes,
    createSearchRootNode,
    dedupeEdgesById,
    graphNodeToAppNode,
} from "./graphMappers"

type GraphExplorerActionsDeps = {
    nodes: AppNode[]
    edges: Edge[]
    setNodes: (nodes: AppNode[]) => void
    setEdges: (edges: Edge[]) => void
    setLoading: (loading: boolean) => void
    setActiveNodeId: (nodeId: string | null) => void
    setSelectedNode: (node: AppNode | null) => void
    setModalOpen: (open: boolean) => void
}

export function useGraphExplorerActions({
    nodes,
    edges,
    setNodes,
    setEdges,
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

            const existingIds = nodes
                .map((currentNode) => Number(currentNode.id))
                .filter((id) => Number.isFinite(id))

            setLoading(true)

            try {
                const response = await GraphService.expandGraph({
                    requestBody: {
                        source_article_id: sourceId,
                        existing_node_ids: existingIds,
                    },
                    limit: EXPAND_SIMILAR_LIMIT,
                    threshold: EXPAND_SIMILAR_THRESHOLD,
                })

                const newNodes = response.new_nodes.map((newNode, index) =>
                    graphNodeToAppNode(
                        newNode,
                        {
                            x: node.position.x,
                            y: node.position.y + 80,
                        },
                        getStaggerDelay(index, 120, 80),
                    ),
                )

                const newEdges = response.new_edges.map((edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                }))

                const mergedNodes = [...nodes, ...newNodes]
                const mergedEdges = dedupeEdgesById([...edges, ...newEdges])
                const layoutNodes = applyTreeLayout(mergedNodes, mergedEdges)

                setNodes(layoutNodes)
                setEdges(mergedEdges)
            } catch (error) {
                console.error("Error expanding graph:", error)
            } finally {
                setLoading(false)
            }
        },
        [edges, nodes, setEdges, setLoading, setNodes],
    )

    const handleSearch = useCallback(
        async (query: string) => {
            setLoading(true)
            setActiveNodeId(null)
            setSelectedNode(null)
            setModalOpen(false)

            try {
                const response = await SearchService.searchArticles({
                    q: query,
                    limit: SEARCH_ARTICLES_LIMIT,
                })

                const centralNode = createSearchRootNode(query)
                const resultNodes = createSearchResultNodes(response.results)
                const newEdges = createSearchEdges(response.results)
                const nextNodes = [centralNode, ...resultNodes]
                const layoutNodes = applyTreeLayout(nextNodes, newEdges)

                setNodes(layoutNodes)
                setEdges(newEdges)
            } catch (error) {
                console.error("Error:", error)
            } finally {
                setLoading(false)
            }
        },
        [
            setActiveNodeId,
            setEdges,
            setLoading,
            setModalOpen,
            setNodes,
            setSelectedNode,
        ],
    )

    return { expandSimilarFromNode, handleSearch }
}
