import type { Edge } from "@xyflow/react"

/**
 * Devuelve todos los ids alcanzables downstream desde `rootId` (sin incluir rootId).
 */
export function collectDownstreamNodeIds(
  rootId: string,
  edges: Edge[],
): Set<string> {
  const childrenBySource = new Map<string, string[]>()

  for (const edge of edges) {
    const source = String(edge.source)
    const target = String(edge.target)
    const current = childrenBySource.get(source) ?? []
    childrenBySource.set(source, [...current, target])
  }

  const downstream = new Set<string>()
  const queue = [...(childrenBySource.get(rootId) ?? [])]

  while (queue.length > 0) {
    const nodeId = queue.shift()
    if (!nodeId || downstream.has(nodeId)) {
      continue
    }

    downstream.add(nodeId)
    const children = childrenBySource.get(nodeId) ?? []
    queue.push(...children)
  }

  return downstream
}
