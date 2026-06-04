import type { Edge } from "@xyflow/react"

import type { GraphFlowEdgeData } from "./GraphFlowEdge"

const GRAPH_FLOW_EDGE_TYPE = "graphFlow"

export function decorateEdgesForFocus(
  edges: Edge[],
  focusNodeId: string | null,
): Edge[] {
  return edges.map((edge) => {
    const source = String(edge.source)
    const target = String(edge.target)
    const highlighted =
      focusNodeId !== null &&
      (source === focusNodeId || target === focusNodeId)

    const data: GraphFlowEdgeData = {
      ...(typeof edge.data === "object" && edge.data !== null
        ? (edge.data as GraphFlowEdgeData)
        : {}),
      highlighted,
    }

    return {
      ...edge,
      type: GRAPH_FLOW_EDGE_TYPE,
      data,
      zIndex: highlighted ? 10 : 0,
    }
  })
}
