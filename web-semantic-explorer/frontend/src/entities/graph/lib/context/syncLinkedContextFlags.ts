import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

import { isFilterNodeType, isInputNodeType } from "@/entities/graph/model/graphNodeTypes"

/**
 * Marca en data de cada artículo si tiene input/filtro cableado downstream.
 * Solo debe llamarse cuando cambia la topología (aristas/nodos), no al arrastrar.
 */
export function syncLinkedContextFlags(
  nodes: AppNode[],
  edges: Edge[],
): AppNode[] {
  const contextTargetIds = new Set(
    nodes
      .filter(
        (node) => isInputNodeType(node.type) || isFilterNodeType(node.type),
      )
      .map((node) => node.id),
  )

  let changed = false

  const nextNodes = nodes.map((node) => {
    if (node.type !== "article") {
      return node
    }

    const hasLinked = edges.some(
      (edge) =>
        String(edge.source) === node.id &&
        contextTargetIds.has(String(edge.target)),
    )

    if (node.data.hasLinkedDownstreamContext === hasLinked) {
      return node
    }

    changed = true
    return {
      ...node,
      data: {
        ...node.data,
        hasLinkedDownstreamContext: hasLinked,
      },
    }
  })

  return changed ? nextNodes : nodes
}
