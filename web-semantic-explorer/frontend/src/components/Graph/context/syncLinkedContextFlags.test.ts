import { describe, expect, it } from "vitest"

import type { AppNode } from "@/store/useGraphStore"

import { syncLinkedContextFlags } from "./syncLinkedContextFlags"

describe("syncLinkedContextFlags", () => {
  it("marca artículo con hijo input", () => {
    const nodes: AppNode[] = [
      {
        id: "1",
        type: "article",
        position: { x: 0, y: 0 },
        data: { title: "A" },
      },
      {
        id: "input-1",
        type: "input",
        position: { x: 0, y: 0 },
        data: { title: "Q", query: "casa" },
      },
    ]
    const edges = [{ id: "e1", source: "1", target: "input-1" }]

    const result = syncLinkedContextFlags(nodes, edges)

    expect(result[0].data.hasLinkedDownstreamContext).toBe(true)
  })

  it("reutiliza la misma referencia de nodes si no hay cambios", () => {
    const nodes: AppNode[] = [
      {
        id: "1",
        type: "article",
        position: { x: 0, y: 0 },
        data: { title: "A", hasLinkedDownstreamContext: false },
      },
    ]

    const result = syncLinkedContextFlags(nodes, [])
    expect(result).toBe(nodes)
  })
})
