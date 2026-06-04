import type { Edge, ReactFlowInstance } from "@xyflow/react"

import { GRAPH_LAYOUT_TREE } from "@/entities/graph"
import type { AppNode } from "@/store/useGraphStore"
import { useGraphStore } from "@/store/useGraphStore"

type CenterViewportOptions = {
  duration?: number
  zoom?: number
}

export function centerViewportOnNodeInFlow(
  flow: ReactFlowInstance<AppNode, Edge>,
  nodeId: string,
  options: CenterViewportOptions = {},
): void {
  const node = useGraphStore.getState().nodes.find((candidate) => candidate.id === nodeId)
  if (!node) {
    return
  }

  const width =
    node.measured?.width ?? node.width ?? GRAPH_LAYOUT_TREE.nodeWidth
  const height =
    node.measured?.height ?? node.height ?? GRAPH_LAYOUT_TREE.nodeHeight

  const x = node.position.x + width / 2
  const y = node.position.y + height / 2

  flow.setCenter(x, y, {
    zoom: options.zoom ?? flow.getZoom(),
    duration: options.duration ?? 450,
  })
}

/** Espera a que React Flow aplique posiciones tras setNodes antes de centrar. */
export function scheduleCenterViewportOnNode(
  flow: ReactFlowInstance<AppNode, Edge> | null,
  nodeId: string,
  options?: CenterViewportOptions,
): void {
  if (!flow) {
    return
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      centerViewportOnNodeInFlow(flow, nodeId, options)
    })
  })
}
