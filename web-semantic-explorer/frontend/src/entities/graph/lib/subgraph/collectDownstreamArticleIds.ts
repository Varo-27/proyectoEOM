import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

import { collectDownstreamNodeIds } from "./collectDownstreamNodeIds"

/**
 * Artículos alcanzables downstream desde un input (no elimina filtros ni otros inputs).
 */
export function collectDownstreamArticleIds(
  rootId: string,
  nodes: AppNode[],
  edges: Edge[],
): Set<string> {
  const downstreamIds = collectDownstreamNodeIds(rootId, edges)
  const articleIds = new Set<string>()

  for (const nodeId of downstreamIds) {
    const node = nodes.find((candidate) => candidate.id === nodeId)
    if (node?.type === "article") {
      articleIds.add(nodeId)
    }
  }

  return articleIds
}

export function removeEdgesTouchingNodes(
  edges: Edge[],
  removedNodeIds: Set<string>,
): Edge[] {
  return edges.filter(
    (edge) =>
      !removedNodeIds.has(String(edge.source)) &&
      !removedNodeIds.has(String(edge.target)),
  )
}
