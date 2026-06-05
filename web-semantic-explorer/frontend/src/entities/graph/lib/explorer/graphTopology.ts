import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

export function inDegree(
  nodeIds: Iterable<string>,
  edges: Edge[],
): Map<string, number> {
  const nodeIdSet = new Set(nodeIds)
  const degrees = new Map<string, number>()

  for (const nodeId of nodeIdSet) {
    degrees.set(nodeId, 0)
  }

  for (const edge of edges) {
    const target = String(edge.target)
    if (!nodeIdSet.has(target)) {
      continue
    }
    degrees.set(target, (degrees.get(target) ?? 0) + 1)
  }

  return degrees
}

export function findConnectedComponents(
  nodes: AppNode[],
  edges: Edge[],
): string[][] {
  const nodeIds = nodes.map((node) => node.id)
  const nodeIdSet = new Set(nodeIds)

  const adjacency = new Map<string, Set<string>>()
  for (const nodeId of nodeIds) {
    adjacency.set(nodeId, new Set())
  }

  for (const edge of edges) {
    const source = String(edge.source)
    const target = String(edge.target)
    if (!nodeIdSet.has(source) || !nodeIdSet.has(target)) {
      continue
    }
    adjacency.get(source)?.add(target)
    adjacency.get(target)?.add(source)
  }

  const visited = new Set<string>()
  const components: string[][] = []

  for (const nodeId of nodeIds) {
    if (visited.has(nodeId)) {
      continue
    }

    const component: string[] = []
    const queue = [nodeId]

    while (queue.length > 0) {
      const current = queue.shift()
      if (!current || visited.has(current)) {
        continue
      }

      visited.add(current)
      component.push(current)

      for (const neighbor of adjacency.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor)
        }
      }
    }

    components.push(component)
  }

  return components
}

export function filterSubgraph(
  nodes: AppNode[],
  edges: Edge[],
  nodeIds: Iterable<string>,
): { nodes: AppNode[]; edges: Edge[] } {
  const nodeIdSet = new Set(nodeIds)
  const filteredNodes = nodes.filter((node) => nodeIdSet.has(node.id))
  const filteredEdges = edges.filter((edge) => {
    const source = String(edge.source)
    const target = String(edge.target)
    return nodeIdSet.has(source) && nodeIdSet.has(target)
  })

  return { nodes: filteredNodes, edges: filteredEdges }
}
