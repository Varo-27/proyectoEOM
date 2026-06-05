import type { Edge } from "@xyflow/react"

import { inDegree } from "./graphTopology"

/**
 * Asigna capas Sugiyama con regla longest-path:
 * - inDegree 0 → capa 1
 * - con padres → 1 + max(capa(padres))
 */
export function assignLayersLongestPath(
  nodeIds: string[],
  edges: Edge[],
): Map<string, number> {
  if (nodeIds.length === 0) {
    return new Map()
  }

  const nodeIdSet = new Set(nodeIds)
  const degrees = inDegree(nodeIdSet, edges)
  const parentsByTarget = new Map<string, string[]>()

  for (const edge of edges) {
    const source = String(edge.source)
    const target = String(edge.target)
    if (!nodeIdSet.has(source) || !nodeIdSet.has(target)) {
      continue
    }
    const current = parentsByTarget.get(target) ?? []
    parentsByTarget.set(target, [...current, source])
  }

  const layers = new Map<string, number>()

  for (const nodeId of nodeIds) {
    if ((degrees.get(nodeId) ?? 0) === 0) {
      layers.set(nodeId, 1)
    }
  }

  let changed = true
  let iterations = 0
  const maxIterations = nodeIds.length + 1

  while (changed && iterations < maxIterations) {
    iterations += 1
    changed = false

    for (const nodeId of nodeIds) {
      const parents = parentsByTarget.get(nodeId) ?? []
      const nextLayer =
        parents.length === 0
          ? 1
          : 1 + Math.max(...parents.map((parentId) => layers.get(parentId) ?? 0))

      if (layers.get(nodeId) !== nextLayer) {
        layers.set(nodeId, nextLayer)
        changed = true
      }
    }
  }

  return layers
}
