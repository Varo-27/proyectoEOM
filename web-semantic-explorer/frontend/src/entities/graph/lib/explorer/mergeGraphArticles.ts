import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

import { dedupeEdgesById } from "@/entities/graph/lib/mappers/dedupeEdges"

type MergeGraphArticlesResult = {
  nodes: AppNode[]
  edges: Edge[]
}

/**
 * Fusiona nodos-artículo nuevos con los existentes: un solo nodo por article id.
 * Las aristas hacia artículos ya presentes se conservan.
 */
export function mergeGraphArticles(
  existingNodes: AppNode[],
  existingEdges: Edge[],
  incomingNodes: AppNode[],
  incomingEdges: Edge[],
): MergeGraphArticlesResult {
  const nodesById = new Map(existingNodes.map((node) => [node.id, node]))

  for (const node of incomingNodes) {
    if (node.type === "article" && nodesById.has(node.id)) {
      continue
    }
    nodesById.set(node.id, node)
  }

  return {
    nodes: Array.from(nodesById.values()),
    edges: dedupeEdgesById([...existingEdges, ...incomingEdges]),
  }
}
