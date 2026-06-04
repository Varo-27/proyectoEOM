import { describe, expect, it } from "vitest"

import type { AppNode } from "@/entities/graph/model/types"

import { resolveContextChain } from "./resolveContextChain"

function inputNode(id: string, query: string): AppNode {
  return {
    id,
    type: "input",
    position: { x: 0, y: 0 },
    data: { title: `Búsqueda: ${query}`, query },
  }
}

function filterNode(
  id: string,
  filterKey: string,
  filterValue: string,
): AppNode {
  return {
    id,
    type: "filter",
    position: { x: 0, y: 0 },
    data: {
      title: "Filtro",
      filterKey,
      filterValue,
    },
  }
}

function articleNode(id: string): AppNode {
  return {
    id,
    type: "article",
    position: { x: 0, y: 0 },
    data: { title: `Artículo ${id}` },
  }
}

describe("resolveContextChain", () => {
  it("recorre input → filtro → artículo y acumula semilla y filtros", () => {
    const nodes = [
      inputNode("input-1", "casa"),
      filterNode("filter-1", "author", "Smith"),
      articleNode("42"),
    ]
    const edges = [
      { id: "e1", source: "input-1", target: "filter-1" },
      { id: "e2", source: "filter-1", target: "42" },
    ]

    const chain = resolveContextChain("42", nodes, edges)

    expect(chain.seedQueries).toEqual(["casa"])
    expect(chain.rootInputNodeId).toBe("input-1")
    expect(chain.upstreamFilters).toEqual({ author: "Smith" })
    expect(chain.contextArticleIds).toEqual([42])
  })

  it("devuelve vacío si el nodo no tiene ancestros en el grafo", () => {
    const nodes = [articleNode("7")]
    const chain = resolveContextChain("7", nodes, [])

    expect(chain.seedQueries).toEqual([])
    expect(chain.rootInputNodeId).toBeNull()
    expect(chain.upstreamFilters).toEqual({})
  })
})
