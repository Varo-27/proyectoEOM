import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  type NodeMouseHandler,
  type NodeTypes,
  ReactFlow,
  type ReactFlowInstance,
  applyNodeChanges,
  type NodeChange,
} from "@xyflow/react"
import { memo, useCallback, useEffect, useRef, useState } from "react"

import { type AppNode, useGraphStore } from "@/store/useGraphStore"
import { useWorkspaceStore } from "@/store/workspace/useWorkspaceStore"
import type { WorkspaceViewport } from "@/store/workspace/types"

import {
  GRAPH_BACKGROUND_GRID_COLOR,
  GRAPH_BACKGROUND_PROPS,
  GRAPH_FIT_VIEW_OPTIONS,
  GRAPH_MAX_ZOOM,
  GRAPH_MIN_ZOOM,
} from "./graphConstants"
import { isActiveNodeDrag } from "./graphFlowDrag"

type GraphFlowCanvasProps = {
  nodeTypes: NodeTypes
  colorMode: "light" | "dark" | "system"
  activeNodeId: string | null
  onInit: (instance: ReactFlowInstance<AppNode, Edge>) => void
  onNodeClick: NodeMouseHandler<AppNode>
  onEdgesDelete: (edges: Edge[]) => void
  onMoveEnd: (viewport: WorkspaceViewport | null) => void
  isWorkspaceHydrated: boolean
}

function GraphFlowCanvasComponent({
  nodeTypes,
  colorMode,
  activeNodeId,
  onInit,
  onNodeClick,
  onEdgesDelete,
  onMoveEnd,
  isWorkspaceHydrated,
}: GraphFlowCanvasProps) {
  const reactFlowRef = useRef<ReactFlowInstance<AppNode, Edge> | null>(null)
  const fitViewDoneRef = useRef(false)
  const isDraggingRef = useRef(false)
  const skipStoreSyncRef = useRef(false)

  const storeNodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange)
  const onConnect = useGraphStore((state) => state.onConnect)
  const commitNodes = useGraphStore((state) => state.commitNodes)

  const [flowNodes, setFlowNodes] = useState(storeNodes)

  useEffect(() => {
    if (skipStoreSyncRef.current) {
      skipStoreSyncRef.current = false
      return
    }

    if (!isDraggingRef.current) {
      setFlowNodes(storeNodes)
    }
  }, [storeNodes])

  useEffect(() => {
    if (!isWorkspaceHydrated || fitViewDoneRef.current || storeNodes.length === 0) {
      return
    }

    const active = useWorkspaceStore.getState().getActiveWorkspace()
    const saved = active?.graph.viewport

    fitViewDoneRef.current = true

    requestAnimationFrame(() => {
      const flow = reactFlowRef.current
      if (!flow) {
        return
      }

      if (saved) {
        flow.setViewport(saved)
        return
      }

      flow.fitView(GRAPH_FIT_VIEW_OPTIONS)
    })
  }, [isWorkspaceHydrated, storeNodes.length])

  const handleFlowInit = useCallback(
    (instance: ReactFlowInstance<AppNode, Edge>) => {
      reactFlowRef.current = instance
      onInit(instance)
    },
    [onInit],
  )

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (isActiveNodeDrag(changes)) {
        isDraggingRef.current = true
        setFlowNodes((current) => applyNodeChanges(changes, current) as AppNode[])
        return
      }

      isDraggingRef.current = false
      setFlowNodes((current) => {
        const next = applyNodeChanges(changes, current) as AppNode[]
        skipStoreSyncRef.current = true
        commitNodes(next, changes)
        return next
      })
    },
    [commitNodes],
  )

  const handleMoveEnd = useCallback(() => {
    const viewport = reactFlowRef.current?.getViewport()
    onMoveEnd(
      viewport
        ? { x: viewport.x, y: viewport.y, zoom: viewport.zoom }
        : null,
    )
  }, [onMoveEnd])

  const miniMapNodeColor = useCallback(
    (node: { id: string }) =>
      node.id === activeNodeId
        ? "var(--color-primary)"
        : "var(--color-muted-foreground)",
    [activeNodeId],
  )

  return (
    <ReactFlow
      className="h-full w-full"
      style={{ width: "100%", height: "100%" }}
      nodes={flowNodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgesDelete={onEdgesDelete}
      deleteKeyCode={["Backspace", "Delete"]}
      onInit={handleFlowInit}
      onMoveEnd={handleMoveEnd}
      onNodeClick={onNodeClick}
      colorMode={colorMode}
      minZoom={GRAPH_MIN_ZOOM}
      maxZoom={GRAPH_MAX_ZOOM}
      onlyRenderVisibleElements
    >
      <Controls />
      <MiniMap nodeColor={miniMapNodeColor} zoomable pannable />
      <Background
        variant={BackgroundVariant.Lines}
        gap={GRAPH_BACKGROUND_PROPS.gap}
        size={GRAPH_BACKGROUND_PROPS.size}
        color={GRAPH_BACKGROUND_GRID_COLOR}
      />
    </ReactFlow>
  )
}

export const GraphFlowCanvas = memo(GraphFlowCanvasComponent)
