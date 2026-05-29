import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    type NodeTypes,
    ReactFlow,
    type NodeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useRef } from "react"

import { useTheme } from "@/components/theme-provider"
import { type AppNode, useGraphStore } from "@/store/useGraphStore"
import { ArticleNodeModal } from "./ArticleNodeModal"
import {
    GRAPH_BACKGROUND_GRID_COLOR,
    GRAPH_BACKGROUND_PROPS,
    GRAPH_FIT_VIEW_OPTIONS,
    GRAPH_MAX_ZOOM,
    GRAPH_MIN_ZOOM,
    SEARCH_ROOT_ID,
} from "./graphConstants"
import { useGraphExplorerActions } from "./useGraphExplorerActions"
import { ArticleNode } from "./nodes/ArticleNode"
import { SearchNode } from "./nodes/SearchNode"
import { SearchBar } from "./SearchBar"

const nodeTypes: NodeTypes = {
    article: ArticleNode,
    searchCenter: SearchNode,
}

type GraphExplorerProps = {
    initialPlace?: string
    initialQuery?: string
}

export default function GraphExplorer({
    initialPlace,
    initialQuery,
}: GraphExplorerProps) {
    const navigate = useNavigate()
    const { resolvedTheme } = useTheme()
    const seededSearchRef = useRef<string | null>(null)
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setNodes,
        setEdges,
        isLoading,
        setLoading,
        activeNodeId,
        setActiveNodeId,
        selectedNode,
        setSelectedNode,
        modalOpen,
        setModalOpen,
        setExpandSimilar,
        clearGraph,
    } = useGraphStore()

    const { expandSimilarFromNode, handleSearch } = useGraphExplorerActions({
        nodes,
        edges,
        setNodes,
        setEdges,
        setLoading,
        setActiveNodeId,
        setSelectedNode,
        setModalOpen,
    })

    useEffect(() => {
        setExpandSimilar((nodeId: string) => {
            const node = useGraphStore
                .getState()
                .nodes.find((n) => n.id === nodeId)
            if (node) {
                void expandSimilarFromNode(node)
            }
        })

        return () => setExpandSimilar(null)
    }, [expandSimilarFromNode, setExpandSimilar])

    useEffect(() => () => clearGraph(), [clearGraph])

    const seedQuery = initialQuery ?? initialPlace

    useEffect(() => {
        if (!seedQuery || seededSearchRef.current === seedQuery) {
            return
        }
        seededSearchRef.current = seedQuery
        void handleSearch(seedQuery)
    }, [seedQuery, handleSearch])

    const clearPlaceFilter = () => {
        navigate({ to: "/", search: {} })
    }

    const handleNodeClick: NodeMouseHandler<AppNode> = useCallback(
        (_event, node) => {
            if (node.id === SEARCH_ROOT_ID) {
                return
            }

            setActiveNodeId(node.id)
            setSelectedNode(node)
            setModalOpen(true)
        },
        [setActiveNodeId, setModalOpen, setSelectedNode],
    )

    return (
        <div className="relative flex h-full min-h-0 w-full flex-col bg-muted/20">
            <SearchBar
                onSearch={handleSearch}
                isLoading={isLoading}
                initialQuery={seedQuery ?? ""}
                placeFilter={initialPlace}
                onClearPlace={initialPlace ? clearPlaceFilter : undefined}
            />
            <ArticleNodeModal
                node={selectedNode}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
            <div className="relative min-h-0 flex-1">
                <ReactFlow
                    className="h-full w-full"
                    style={{ width: "100%", height: "100%" }}
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    colorMode={resolvedTheme}
                    minZoom={GRAPH_MIN_ZOOM}
                    maxZoom={GRAPH_MAX_ZOOM}
                    fitView
                    fitViewOptions={GRAPH_FIT_VIEW_OPTIONS}
                >
                    <Controls />
                    <MiniMap
                        nodeColor={(node) =>
                            node.id === activeNodeId
                                ? "var(--color-primary)"
                                : "var(--color-muted-foreground)"
                        }
                    />
                    <Background
                        variant={BackgroundVariant.Lines}
                        gap={GRAPH_BACKGROUND_PROPS.gap}
                        size={GRAPH_BACKGROUND_PROPS.size}
                        color={GRAPH_BACKGROUND_GRID_COLOR}
                    />
                </ReactFlow>
            </div>
        </div>
    )
}
