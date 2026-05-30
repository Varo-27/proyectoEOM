import { describe, expect, it } from "vitest"

import type { AppNode } from "@/store/useGraphStore"

import { collectDownstreamArticleIds } from "./collectDownstreamArticleIds"

describe("collectDownstreamArticleIds", () => {
  it("solo devuelve artículos downstream, no filtros", () => {
    const nodes: AppNode[] = [
      {
        id: "in",
        type: "input",
        position: { x: 0, y: 0 },
        data: { title: "Q" },
      },
      {
        id: "f",
        type: "filter",
        position: { x: 0, y: 0 },
        data: { title: "F" },
      },
      {
        id: "1",
        type: "article",
        position: { x: 0, y: 0 },
        data: { title: "A" },
      },
    ]
    const edges = [
      { id: "e1", source: "in", target: "f" },
      { id: "e2", source: "f", target: "1" },
    ]

    const ids = collectDownstreamArticleIds("in", nodes, edges)

    expect(ids.has("1")).toBe(true)
    expect(ids.has("f")).toBe(false)
    expect(ids.has("in")).toBe(false)
  })
})
