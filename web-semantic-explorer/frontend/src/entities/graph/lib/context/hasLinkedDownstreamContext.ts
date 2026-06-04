import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

import { isFilterNodeType, isInputNodeType } from "@/entities/graph/model/graphNodeTypes"

/** True si bajo el artículo hay un input o filtro cableado (modo expansión enlazada). */
export function hasLinkedDownstreamContext(
  articleNodeId: string,
  nodes: AppNode[],
  edges: Edge[],
): boolean {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  return edges.some((edge) => {
    if (String(edge.source) !== articleNodeId) {
      return false
    }

    const child = nodeById.get(String(edge.target))
    if (!child) {
      return false
    }

    return isInputNodeType(child.type) || isFilterNodeType(child.type)
  })
}
