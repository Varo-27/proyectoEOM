import { describe, expect, it, vi } from "vitest"

import { GRAPH_NODE_TYPE } from "@/entities/graph/model/graphNodeTypes"
import type { AppNode } from "@/entities/graph/model/types"

import { applySugiyamaLayout } from "./graphLayout"
import { findConnectedComponents } from "./graphTopology"

function queryNode(id: string): AppNode {
  return {
    id,
    type: GRAPH_NODE_TYPE.query,
    position: { x: 0, y: 0 },
    data: { title: id },
  }
}

function filterNode(id: string): AppNode {
  return {
    id,
    type: GRAPH_NODE_TYPE.filter,
    position: { x: 0, y: 0 },
    data: { title: id, filterKey: "place", filterValue: "Madrid" },
  }
}

function articleNode(id: string): AppNode {
  return {
    id,
    type: GRAPH_NODE_TYPE.article,
    position: { x: 0, y: 0 },
    data: { title: id },
  }
}

describe("findConnectedComponents", () => {
  it("fusiona nodos conectados por un artículo compartido", () => {
    const nodes = [
      queryNode("query-a"),
      queryNode("query-b"),
      articleNode("shared"),
    ]
    const edges = [
      { id: "e1", source: "query-a", target: "shared" },
      { id: "e2", source: "query-b", target: "shared" },
    ]

    expect(findConnectedComponents(nodes, edges)).toHaveLength(1)
  })

  it("separa componentes inconexos", () => {
    const nodes = [queryNode("query-a"), queryNode("query-b"), articleNode("a1")]
    const edges = [{ id: "e1", source: "query-a", target: "a1" }]

    expect(findConnectedComponents(nodes, edges)).toHaveLength(2)
  })
})

describe("applySugiyamaLayout", () => {
  it("asigna layoutLayer input=1, filtro=2, artículos=3", () => {
    vi.stubGlobal("window", { innerWidth: 1200 })

    const layouted = applySugiyamaLayout(
      [queryNode("input"), filterNode("filter"), articleNode("a1")],
      [
        { id: "e1", source: "input", target: "filter" },
        { id: "e2", source: "filter", target: "a1" },
      ],
    )

    const byId = new Map(layouted.map((node) => [node.id, node]))

    expect(byId.get("input")?.data.layoutLayer).toBe(1)
    expect(byId.get("filter")?.data.layoutLayer).toBe(2)
    expect(byId.get("a1")?.data.layoutLayer).toBe(3)
  })

  it("coloca componentes inconexos en la misma Y por capa y separados en X", () => {
    vi.stubGlobal("window", { innerWidth: 1200 })

    const layouted = applySugiyamaLayout(
      [
        queryNode("query-a"),
        queryNode("query-b"),
        articleNode("a1"),
        articleNode("b1"),
      ],
      [
        { id: "e1", source: "query-a", target: "a1" },
        { id: "e2", source: "query-b", target: "b1" },
      ],
    )
    const byId = new Map(layouted.map((node) => [node.id, node.position]))

    expect(byId.get("query-a")?.y).toBeCloseTo(byId.get("query-b")?.y ?? 0, 0)
    expect(byId.get("a1")?.y).toBeCloseTo(byId.get("b1")?.y ?? 0, 0)
    expect(byId.get("query-b")?.x).toBeGreaterThan(byId.get("query-a")?.x ?? 0)
  })

  it("termina con ciclos gracias al acyclicer de dagre", () => {
    vi.stubGlobal("window", { innerWidth: 1200 })

    expect(() =>
      applySugiyamaLayout(
        [queryNode("input"), articleNode("a1")],
        [
          { id: "e1", source: "input", target: "a1" },
          { id: "e2", source: "a1", target: "input" },
        ],
      ),
    ).not.toThrow()
  })
})
