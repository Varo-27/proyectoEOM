import type { XYPosition } from "@xyflow/react"

import type { FilterNodeKind } from "@/entities/graph"

/** Dimensiones aproximadas para centrar el nodo bajo el cursor al soltar. */
export const PALETTE_NODE_DIMENSIONS = {
  query: { width: 300, height: 190 },
  filter: { width: 260, height: 130 },
} as const

export function centerPaletteDropPosition(
  position: XYPosition,
  kind: "query" | FilterNodeKind,
): XYPosition {
  const dims =
    kind === "query"
      ? PALETTE_NODE_DIMENSIONS.query
      : PALETTE_NODE_DIMENSIONS.filter

  return {
    x: position.x - dims.width / 2,
    y: position.y - dims.height / 2,
  }
}
