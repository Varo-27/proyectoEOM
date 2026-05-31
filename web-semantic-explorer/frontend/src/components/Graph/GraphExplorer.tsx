import { type Edge, type NodeMouseHandler, type NodeTypes } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useCallback, useEffect, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"

import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { type AppNode, useGraphStore } from "@/store/useGraphStore"
import { useWorkspaceStore } from "@/store/workspace/useWorkspaceStore"
import type { WorkspaceViewport } from "@/store/workspace/types"
import { ArticleNodeModal } from "./ArticleNodeModal"
import { GRAPH_NODE_TYPE } from "./graphNodeTypes"
import { GraphFlowCanvas } from "./GraphFlowCanvas"
import { ArticleNode } from "./nodes/ArticleNode"
import { FilterNode } from "./nodes/FilterNode"
import { InputNode } from "./nodes/InputNode"
import { SearchNode } from "./nodes/SearchNode"
import {
  createFilterNodeAtPosition,
  createInputNodeAtPosition,
} from "./palette/createPaletteNode"
import { GraphNodePalette } from "./palette/GraphNodePalette"
import { isPaletteDragEvent, readPaletteDragData } from "./palette/paletteDrag"
import { scheduleCenterViewportOnNode } from "./centerViewportOnNode"
import { useGraphExplorerActions } from "./useGraphExplorerActions"
import { useWorkspaceAutosave } from "./workspace/useWorkspaceAutosave"
import { WorkspaceBar } from "./workspace/WorkspaceBar"

const nodeTypes: NodeTypes = {
  article: ArticleNode,
  input: InputNode,
  filter: FilterNode,
  searchCenter: SearchNode,
}

const VIEWPORT_SAVE_MS = 800

export default function GraphExplorer() {
  const { resolvedTheme } = useTheme()
  const reactFlowRef = useRef<import("@xyflow/react").ReactFlowInstance<
    AppNode,
    Edge
  > | null>(null)
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

  const { expandSimilarFromNode, searchFromInputNode } =
    useGraphExplorerActions({
      setNodes,
      setLoading,
      setActiveNodeId,
      setSelectedNode,
      setModalOpen,
      centerViewportOnNode,
    })

  useEffect(() => {
    hydrateForCurrentUser()
  }, [hydrateForCurrentUser])

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

      const position = flow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const currentNodes = useGraphStore.getState().nodes
      const newNode =
        payload.type === "input"
          ? createInputNodeAtPosition(position)
          : createFilterNodeAtPosition(payload.filterKey, position)

      setNodes([...currentNodes, newNode])
    },
    [setNodes],
  )

  const handleNodeClick: NodeMouseHandler<AppNode> = useCallback(
    (_event, node) => {
      if (
        node.type === GRAPH_NODE_TYPE.input ||
        node.type === GRAPH_NODE_TYPE.filter
      ) {
        return
      }

      setActiveNodeId(node.id)
      setSelectedNode(node)
      setModalOpen(true)
    },
    [setActiveNodeId, setModalOpen, setSelectedNode],
  )

  const handleEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      removeEdges(deletedEdges.map((edge) => edge.id))
    },
    [removeEdges],
  )

  if (!isWorkspaceHydrated) {
    return (
      <div className="graph-explorer__loading">Cargando área de trabajo…</div>
    )
  }

  return (
    <div className="graph-explorer">
      <div className="graph-explorer__layout">
        <aside className="graph-explorer__sidebar">
          <WorkspaceBar />
          <GraphNodePalette isLoading={isLoading} />
        </aside>

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
          />
        </div>
      </div>
    </div>
  )
}
