import { describe, expect, it } from "vitest"

import { GRAPH_NODE_TYPE } from "@/entities/graph/model/graphNodeTypes"
import type { AppNode } from "@/entities/graph/model/types"

import { assignLayersLongestPath } from "./graphLayerAssignment"

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

describe("assignLayersLongestPath", () => {
  it("asigna capa 1 a nodos sin padres", () => {
    const layers = assignLayersLongestPath(["solo"], [])

    expect(layers.get("solo")).toBe(1)
  })

  it("asigna input=1, filtro=2, artículos=3", () => {
    const nodeIds = ["input", "filter", "a1", "a2"]
    const edges = [
      { id: "e1", source: "input", target: "filter" },
      { id: "e2", source: "filter", target: "a1" },
      { id: "e3", source: "filter", target: "a2" },
    ]

    const layers = assignLayersLongestPath(nodeIds, edges)

    expect(layers.get("input")).toBe(1)
    expect(layers.get("filter")).toBe(2)
    expect(layers.get("a1")).toBe(3)
    expect(layers.get("a2")).toBe(3)
  })

  it("usa max(padres)+1 con multi-padre", () => {
    const nodeIds = ["query-a", "query-b", "filter-b", "shared"]
    const edges = [
      { id: "e1", source: "query-a", target: "shared" },
      { id: "e2", source: "query-b", target: "filter-b" },
      { id: "e3", source: "filter-b", target: "shared" },
    ]

    const layers = assignLayersLongestPath(nodeIds, edges)

    expect(layers.get("query-a")).toBe(1)
    expect(layers.get("query-b")).toBe(1)
    expect(layers.get("filter-b")).toBe(2)
    expect(layers.get("shared")).toBe(3)
  })
})
