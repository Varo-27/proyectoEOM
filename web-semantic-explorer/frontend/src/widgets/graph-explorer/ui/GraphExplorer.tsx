import type { Edge, NodeMouseHandler, NodeTypes } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useShallow } from "zustand/react/shallow"
import {
  type AppNode,
  centerPaletteDropPosition,
  createQueryNodeAtPosition,
  GRAPH_NODE_TYPE,
  isValidGraphConnection,
  markArticleVisited,
  useGraphStore,
} from "@/entities/graph"
import type { WorkspaceViewport } from "@/entities/workspace"
import { useWorkspaceStore } from "@/entities/workspace"
import { injectFavoriteToGraph } from "@/features/favorites"
import { useGraphExpand } from "@/features/graph-expand"
import { useGraphSearch, useMapSearchBootstrap } from "@/features/graph-search"
import { useWorkspaceAutosave } from "@/features/workspace-sync"
import { useTheme } from "@/shared/lib/theme/ThemeProvider"
import { cn } from "@/shared/lib/utils"
import { ArticleNodeModal } from "@/widgets/article-modal"

import { scheduleCenterViewportOnNode } from "./centerViewportOnNode"
import { GraphFlowCanvas } from "./GraphFlowCanvas"
import { ArticleNode } from "./nodes/ArticleNode"
import { QueryNode } from "./nodes/InputNode"
import { SearchNode } from "./nodes/SearchNode"
import { GraphNodePalette } from "./palette/GraphNodePalette"
import { isPaletteDragEvent, readPaletteDragData } from "./palette/paletteDrag"
import { FavoritesToolbar } from "./toolbar/FavoritesToolbar"
import { WorkspaceBar } from "./workspace/WorkspaceBar"

const nodeTypes: NodeTypes = {
  article: ArticleNode,
  query: QueryNode,
  input: QueryNode,
  searchCenter: SearchNode,
}

const VIEWPORT_SAVE_MS = 800

export function GraphExplorer() {
  const { resolvedTheme } = useTheme()
  const navigate = useNavigate({ from: "/" })
  const searchParams = useSearch({ from: "/_layout/" })
  const reactFlowRef = useRef<
    import("@xyflow/react").ReactFlowInstance<AppNode, Edge> | null
  >(null)
  const viewportSaveTimerRef = useRef<number | null>(null)
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false)

  const hydrateForCurrentUser = useWorkspaceStore(
    (state) => state.hydrateForCurrentUser,
  )
  const isWorkspaceHydrated = useWorkspaceStore((state) => state.isHydrated)
  const captureActiveWorkspace = useWorkspaceStore(
    (state) => state.captureActiveWorkspace,
  )

  const {
    setNodes,
    nodes,
    isLoading,
    setLoading,
    setActiveNodeId,
    selectedNode,
    setSelectedNode,
    modalOpen,
    setModalOpen,
    setExpandSimilar,
    setSearchFromInput,
    removeEdges,
  } = useGraphStore(
    useShallow((state) => ({
      setNodes: state.setNodes,
      nodes: state.nodes,
      isLoading: state.isLoading,
      setLoading: state.setLoading,
      setActiveNodeId: state.setActiveNodeId,
      selectedNode: state.selectedNode,
      setSelectedNode: state.setSelectedNode,
      modalOpen: state.modalOpen,
      setModalOpen: state.setModalOpen,
      setExpandSimilar: state.setExpandSimilar,
      setSearchFromInput: state.setSearchFromInput,
      removeEdges: state.removeEdges,
    })),
  )

  const centerViewportOnNode = useCallback((nodeId: string) => {
    scheduleCenterViewportOnNode(reactFlowRef.current, nodeId)
  }, [])

  const { expandSimilarFromNode } = useGraphExpand({
    setNodes,
    setLoading,
    centerViewportOnNode,
  })

  const { searchFromInputNode } = useGraphSearch({
    setNodes,
    setLoading,
    setActiveNodeId,
    setSelectedNode,
    setModalOpen,
    centerViewportOnNode,
  })

  useEffect(() => {
    void hydrateForCurrentUser()
  }, [hydrateForCurrentUser])

  useMapSearchBootstrap({
    searchParams,
    enabled: isWorkspaceHydrated,
    onConsumed: () => {
      void navigate({ to: "/", search: {}, replace: true })
    },
  })

  useEffect(() => {
    setExpandSimilar((nodeId: string) => {
      const node = useGraphStore.getState().nodes.find((n) => n.id === nodeId)
      if (node) {
        void expandSimilarFromNode(node)
      }
    })

    setSearchFromInput((inputNodeId, query) => {
      void searchFromInputNode(inputNodeId, query)
    })

    return () => {
      setExpandSimilar(null)
      setSearchFromInput(null)
    }
  }, [
    expandSimilarFromNode,
    searchFromInputNode,
    setExpandSimilar,
    setSearchFromInput,
  ])

  useEffect(() => {
    return () => {
      if (viewportSaveTimerRef.current) {
        window.clearTimeout(viewportSaveTimerRef.current)
      }
      const viewport = reactFlowRef.current?.getViewport()
      captureActiveWorkspace(
        viewport ? { x: viewport.x, y: viewport.y, zoom: viewport.zoom } : null,
      )
    }
  }, [captureActiveWorkspace])

  const getViewport = useCallback(() => {
    const viewport = reactFlowRef.current?.getViewport()
    if (!viewport) {
      return null
    }
    return { x: viewport.x, y: viewport.y, zoom: viewport.zoom }
  }, [])

  useWorkspaceAutosave({
    getViewport,
    enabled: isWorkspaceHydrated,
  })

  const scheduleViewportSave = useCallback(
    (viewport: WorkspaceViewport | null) => {
      if (viewportSaveTimerRef.current) {
        window.clearTimeout(viewportSaveTimerRef.current)
      }
      viewportSaveTimerRef.current = window.setTimeout(() => {
        captureActiveWorkspace(viewport)
        viewportSaveTimerRef.current = null
      }, VIEWPORT_SAVE_MS)
    },
    [captureActiveWorkspace],
  )

  const handleFlowInit = useCallback(
    (instance: import("@xyflow/react").ReactFlowInstance<AppNode, Edge>) => {
      reactFlowRef.current = instance
    },
    [],
  )

  const handleMoveEnd = useCallback(
    (viewport: WorkspaceViewport | null) => {
      scheduleViewportSave(viewport)
    },
    [scheduleViewportSave],
  )

  const handleCanvasDragOver = useCallback((event: React.DragEvent) => {
    if (!isPaletteDragEvent(event)) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    setIsCanvasDragOver(true)
  }, [])

  const handleCanvasDragLeave = useCallback((event: React.DragEvent) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return
    }
    setIsCanvasDragOver(false)
  }, [])

  const handleCanvasDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsCanvasDragOver(false)

      const payload = readPaletteDragData(event)
      const flow = reactFlowRef.current
      if (!payload || !flow) {
        return
      }

      const dropPosition = flow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      if (payload.type === "article") {
        const position = centerPaletteDropPosition(dropPosition, "article")
        const added = injectFavoriteToGraph(payload.favorite, position)

        if (!added) {
          toast.message("Ya está en el lienzo", {
            description:
              payload.favorite.title ??
              `Artículo ${payload.favorite.article_id}`,
          })
          return
        }

        toast.success("Artículo añadido al lienzo")
        return
      }

      if (payload.type !== "query" && payload.type !== "input") {
        return
      }

      const currentNodes = useGraphStore.getState().nodes
      const newNode = createQueryNodeAtPosition(
        centerPaletteDropPosition(dropPosition, "query"),
      )

      const mergedNodes = [...currentNodes, newNode]
      setNodes(mergedNodes)
    },
    [setNodes],
  )

  const handleNodeClick: NodeMouseHandler<AppNode> = useCallback(
    (_event, node) => {
      setActiveNodeId(node.id)

      if (
        node.type === GRAPH_NODE_TYPE.query ||
        node.type === GRAPH_NODE_TYPE.input
      ) {
        return
      }

      const nextNodes = markArticleVisited(
        useGraphStore.getState().nodes,
        node.id,
      )
      setNodes(nextNodes)
      setSelectedNode(node)
      setModalOpen(true)
    },
    [setActiveNodeId, setModalOpen, setNodes, setSelectedNode],
  )

  const handleEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      removeEdges(deletedEdges.map((edge) => edge.id))
    },
    [removeEdges],
  )

  const isValidConnection = useCallback(
    (
      connection:
        | import("@xyflow/react").Edge
        | import("@xyflow/react").Connection,
    ) => isValidGraphConnection(connection, nodes),
    [nodes],
  )

  if (!isWorkspaceHydrated) {
    return (
      <div className="graph-explorer__loading">Cargando área de trabajo…</div>
    )
  }

  return (
    <div className="graph-explorer">
      <div className="graph-explorer__layout">
        <div
          className={cn(
            "graph-explorer__canvas",
            isCanvasDragOver && "graph-explorer__canvas--drag-over",
          )}
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
        >
          <ArticleNodeModal
            node={selectedNode}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
          <GraphFlowCanvas
            nodeTypes={nodeTypes}
            colorMode={resolvedTheme}
            onInit={handleFlowInit}
            onNodeClick={handleNodeClick}
            onEdgesDelete={handleEdgesDelete}
            onMoveEnd={handleMoveEnd}
            isWorkspaceHydrated={isWorkspaceHydrated}
            isValidConnection={isValidConnection}
          />
        </div>

        <aside className="graph-explorer__sidebar">
          <WorkspaceBar />
          <GraphNodePalette isLoading={isLoading} />
          <FavoritesToolbar disabled={isLoading} />
        </aside>
      </div>
    </div>
  )
}

export default GraphExplorer
