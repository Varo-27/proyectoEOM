import type { Edge } from "@xyflow/react"

export function dedupeEdgesById(edges: Edge[]): Edge[] {
  return edges.filter(
    (edge, index, self) =>
      self.findIndex((candidate) => candidate.id === edge.id) === index,
  )
}
