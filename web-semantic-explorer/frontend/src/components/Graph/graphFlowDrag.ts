import type { NodeChange } from "@xyflow/react"

/** Cambios de posición mientras el usuario arrastra (no persistir en store global aún). */
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
