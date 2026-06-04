import {
  type Edge,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
} from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

import { dedupeEdgesById } from "@/entities/graph/lib/mappers/dedupeEdges"

/**
 * Elimina un nodo del grafo.
 * - Artículos: patrón «delete middle node» (reconecta entrantes con salientes).
 * - Input / filtro: solo quita el nodo y sus aristas (sin re-cablear).
 */
export function deleteGraphNode(
  nodeId: string,
  nodes: AppNode[],
  edges: Edge[],
): { nodes: AppNode[]; edges: Edge[] } {
  const target = nodes.find((node) => node.id === nodeId)
  if (!target) {
    return { nodes, edges }
  }

  if (target.type !== "article") {
    return {
      nodes: nodes.filter((node) => node.id !== nodeId),
      edges: edges.filter(
        (edge) =>
          String(edge.source) !== nodeId && String(edge.target) !== nodeId,
      ),
    }
  }

  const incomers = getIncomers(target, nodes, edges)
  const outgoers = getOutgoers(target, nodes, edges)
  const connected = getConnectedEdges([target], edges)

  const remainingEdges = edges.filter((edge) => !connected.includes(edge))

  const createdEdges: Edge[] = []
  for (const sourceNode of incomers) {
    for (const outgoersNode of outgoers) {
      if (sourceNode.id === outgoersNode.id) {
        continue
      }

      createdEdges.push({
        id: `edge-${sourceNode.id}-${outgoersNode.id}-rewire`,
        source: String(sourceNode.id),
        target: String(outgoersNode.id),
      })
    }
  }

  return {
    nodes: nodes.filter((node) => node.id !== nodeId),
    edges: dedupeEdgesById([...remainingEdges, ...createdEdges]),
  }
}
