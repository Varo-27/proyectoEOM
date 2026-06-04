import type { NodeChange } from "@xyflow/react"

export function isActiveNodeDrag(changes: NodeChange[]): boolean {
  return (
    changes.length > 0 &&
    changes.every(
      (change) =>
        change.type === "position" &&
        "dragging" in change &&
        change.dragging === true,
    )
  )
}

export function isPositionOnlyChange(changes: NodeChange[]): boolean {
  return changes.length > 0 && changes.every((change) => change.type === "position")
}
