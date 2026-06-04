import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

/**
 * Añade nodos y aristas al grafo uno a uno (fade-in por entrada en cada montaje).
 */
export async function revealGraphNodesStaggered(
  baseNodes: AppNode[],
  baseEdges: Edge[],
  incomingNodes: AppNode[],
  incomingEdges: Edge[],
  staggerMs: number,
  onStep: (nodes: AppNode[], edges: Edge[]) => void,
): Promise<void> {
  onStep(baseNodes, baseEdges)

  let nodes = [...baseNodes]
  let edges = [...baseEdges]

  for (let index = 0; index < incomingNodes.length; index += 1) {
    if (index > 0) {
      await delay(staggerMs)
    }

    const node = incomingNodes[index]
    const edge = incomingEdges[index]
    nodes = [...nodes, node]
    edges = edge ? [...edges, edge] : edges
    onStep(nodes, edges)
  }
}
