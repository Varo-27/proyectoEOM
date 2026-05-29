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
import {
  filtersToSearchParams,
  type GraphSearchParams,
  searchParamsToFilters,
} from "@/lib/filters"
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
import { SearchFiltersBar } from "./SearchFiltersBar"

const nodeTypes: NodeTypes = {
  article: ArticleNode,
  searchCenter: SearchNode,
}

type GraphExplorerProps = {
  initialSearch?: GraphSearchParams
}

export default function GraphExplorer({ initialSearch = {} }: GraphExplorerProps) {
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
    filters,
    setFilters,
    clearFilters,
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

  const syncSearchToUrl = useCallback(
    (nextFilters: typeof filters, q?: string) => {
      navigate({
        to: "/",
        search: filtersToSearchParams(nextFilters, q),
        replace: true,
      })
    },
    [navigate],
  )

  useEffect(() => {
    setFilters(searchParamsToFilters(initialSearch))
  }, [initialSearch, setFilters])

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

  const initialQuery = initialSearch.q

  useEffect(() => {
    if (!initialQuery || seededSearchRef.current === initialQuery) {
      return
    }
    seededSearchRef.current = initialQuery
    void handleSearch(initialQuery)
  }, [initialQuery, handleSearch])

  const handleFiltersChange = (nextFilters: typeof filters) => {
    setFilters(nextFilters)
    syncSearchToUrl(nextFilters, initialQuery)
  }

  const handleClearFilters = () => {
    clearFilters()
    syncSearchToUrl({}, initialQuery)
  }

  const handleClearFilter = (key: keyof typeof filters) => {
    const nextFilters = { ...filters, [key]: undefined }
    setFilters(nextFilters)
    syncSearchToUrl(nextFilters, initialQuery)
  }

  const handleSearchSubmit = (query: string) => {
    syncSearchToUrl(filters, query)
    void handleSearch(query)
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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-muted/20">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="relative min-h-[min(50vh,360px)] min-w-0 flex-1 overflow-hidden border-b-2 border-foreground lg:min-h-0 lg:border-b-0 lg:border-r-2">
          <SearchBar
            onSearch={handleSearchSubmit}
            isLoading={isLoading}
            initialQuery={initialQuery ?? ""}
          />
          <ArticleNodeModal
            node={selectedNode}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
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

        <SearchFiltersBar
          filters={filters}
          onChange={handleFiltersChange}
          onClear={handleClearFilters}
          onClearFilter={handleClearFilter}
        />
      </div>
    </div>
  )
}
