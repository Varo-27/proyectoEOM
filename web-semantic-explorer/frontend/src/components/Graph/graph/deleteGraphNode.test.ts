import type { Edge } from "@xyflow/react"
import { describe, expect, it } from "vitest"

import type { AppNode } from "@/store/useGraphStore"

import { deleteGraphNode } from "./deleteGraphNode"

function articleNode(id: string): AppNode {
  return {
    id,
    type: "article",
    position: { x: 0, y: 0 },
    data: { title: id },
  }
}

function inputNode(id: string): AppNode {
  return {
    id,
    type: "input",
    position: { x: 0, y: 0 },
    data: { title: "Input", query: "" },
  }
}

describe("deleteGraphNode", () => {
  it("reconecta incomers y outgoers al borrar un artículo intermedio", () => {
    const nodes: AppNode[] = [
      inputNode("in"),
      articleNode("a"),
      articleNode("mid"),
      articleNode("b"),
    ]
    const edges: Edge[] = [
      { id: "e1", source: "in", target: "a" },
      { id: "e2", source: "a", target: "mid" },
      { id: "e3", source: "mid", target: "b" },
    ]

    const result = deleteGraphNode("mid", nodes, edges)

    expect(result.nodes.map((node) => node.id)).toEqual(["in", "a", "b"])
    expect(
      result.edges.some((edge) => edge.source === "a" && edge.target === "b"),
    ).toBe(true)
    expect(
      result.edges.some(
        (edge) => edge.target === "mid" || edge.source === "mid",
      ),
    ).toBe(false)
  })

  it("elimina input y sus aristas sin re-cablear", () => {
    const nodes: AppNode[] = [inputNode("in"), articleNode("a")]
    const edges: Edge[] = [{ id: "e1", source: "in", target: "a" }]

    const result = deleteGraphNode("in", nodes, edges)

    expect(result.nodes).toEqual([articleNode("a")])
    expect(result.edges).toEqual([])
  })
})
