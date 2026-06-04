import { describe, expect, it } from "vitest"

import type { AppNode } from "@/entities/graph/model/types"

import { isValidGraphConnection } from "./isValidGraphConnection"

const connection = (source: string, target: string) => ({
  source,
  target,
  sourceHandle: null,
  targetHandle: null,
})

const queryNode: AppNode = {
  id: "q1",
  type: "query",
  position: { x: 0, y: 0 },
  data: { title: "Consulta", query: "" },
}

const filterNode: AppNode = {
  id: "f1",
  type: "filter",
  position: { x: 0, y: 100 },
  data: { title: "Lugar: ES", filterKey: "place", filterValue: "España" },
}

const articleNode: AppNode = {
  id: "42",
  type: "article",
  position: { x: 0, y: 200 },
  data: { title: "Artículo" },
}

describe("isValidGraphConnection", () => {
  const nodes = [queryNode, filterNode, articleNode]

  it("permite query → filter y filter → article", () => {
    expect(isValidGraphConnection(connection("q1", "f1"), nodes)).toBe(true)
    expect(isValidGraphConnection(connection("f1", "42"), nodes)).toBe(true)
  })

  it("rechaza article → query", () => {
    expect(isValidGraphConnection(connection("42", "q1"), nodes)).toBe(false)
  })

  it("permite article → article", () => {
    const articleB: AppNode = {
      ...articleNode,
      id: "43",
    }
    expect(
      isValidGraphConnection(connection("42", "43"), [...nodes, articleB]),
    ).toBe(true)
  })
})
