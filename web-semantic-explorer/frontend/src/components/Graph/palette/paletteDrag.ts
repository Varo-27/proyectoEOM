import type { FilterNodeKind } from "@/entities/graph"

export const PALETTE_DRAG_MIME = "application/x-wse-graph-node"

export type PaletteDragPayload =
  | { type: "query" }
  | { type: "input" }
  | { type: "filter"; filterKey: FilterNodeKind }

export function setPaletteDragData(
  event: React.DragEvent,
  payload: PaletteDragPayload,
): void {
  event.dataTransfer.setData(PALETTE_DRAG_MIME, JSON.stringify(payload))
  event.dataTransfer.effectAllowed = "move"
}

export function readPaletteDragData(
  event: React.DragEvent,
): PaletteDragPayload | null {
  const raw = event.dataTransfer.getData(PALETTE_DRAG_MIME)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as PaletteDragPayload
    if (parsed.type === "query" || parsed.type === "input") {
      return { type: "query" }
    }
    if (parsed.type === "filter" && typeof parsed.filterKey === "string") {
      return { type: "filter", filterKey: parsed.filterKey as FilterNodeKind }
    }
    return null
  } catch {
    return null
  }
}

export function isPaletteDragEvent(event: React.DragEvent): boolean {
  return event.dataTransfer.types.includes(PALETTE_DRAG_MIME)
}
