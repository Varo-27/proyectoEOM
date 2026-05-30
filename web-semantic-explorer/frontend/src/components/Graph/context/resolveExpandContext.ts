import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/store/useGraphStore"

import { isInputNodeType } from "../graphNodeTypes"
import { collectDownstreamNodeIds } from "../subgraph/collectDownstreamNodeIds"
import { hasLinkedDownstreamContext } from "./hasLinkedDownstreamContext"
import {
  mergeContextFilters,
  type ResolvedContextChain,
  resolveContextChain,
} from "./resolveContextChain"

/**
 * Contexto para expandir un artículo: walk-up normal o tubería enlazada bajo el nodo.
 */
export function resolveExpandContext(
  articleNode: AppNode,
  nodes: AppNode[],
  edges: Edge[],
): ResolvedContextChain {
  if (!hasLinkedDownstreamContext(articleNode.id, nodes, edges)) {
    return resolveContextChain(articleNode.id, nodes, edges)
  }

  const linkedInputId = findDownstreamInputNodeId(articleNode.id, nodes, edges)
  if (!linkedInputId) {
    return resolveContextChain(articleNode.id, nodes, edges)
  }

  return resolveContextChain(linkedInputId, nodes, edges)
}

function findDownstreamInputNodeId(
  articleNodeId: string,
  nodes: AppNode[],
  edges: Edge[],
): string | null {
  const directChildren = edges
    .filter((edge) => String(edge.source) === articleNodeId)
    .map((edge) => String(edge.target))

  for (const childId of directChildren) {
    const child = nodes.find((node) => node.id === childId)
    if (child && isInputNodeType(child.type)) {
      return child.id
    }
  }

  for (const childId of directChildren) {
    const downstreamIds = collectDownstreamNodeIds(childId, edges)
    for (const downstreamId of downstreamIds) {
      const node = nodes.find((candidate) => candidate.id === downstreamId)
      if (node && isInputNodeType(node.type)) {
        return node.id
      }
    }
  }

  return null
}

export { mergeContextFilters }
