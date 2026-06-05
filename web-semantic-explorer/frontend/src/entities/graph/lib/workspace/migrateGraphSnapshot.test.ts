import { describe, expect, it } from "vitest"

import { migrateGraphSnapshot } from "./migrateGraphSnapshot"

describe("migrateGraphSnapshot", () => {
  it("convierte searchCenter en nodo query", () => {
    const snapshot = migrateGraphSnapshot({
      nodes: [
        {
          id: "search-root",
          type: "searchCenter",
          position: { x: 0, y: 0 },
          data: { title: "Búsqueda: economía" },
        },
      ],
      edges: [{ id: "e1", source: "search-root", target: "42" }],
      viewport: null,
    })

    const queryNode = snapshot.nodes[0]
    expect(queryNode.type).toBe("query")
    expect(queryNode.id).not.toBe("search-root")
    expect(queryNode.data.query).toBe("economía")
    expect(snapshot.edges[0].source).toBe(queryNode.id)
  })

  it("elimina props de layout transientes y conserva searched", () => {
    const snapshot = migrateGraphSnapshot({
      nodes: [
        {
          id: "input",
          type: "query",
          position: { x: 0, y: 0 },
          data: {
            title: "Búsqueda: economía",
            query: "economía",
            layoutLayer: 1,
            layoutComponentIndex: 0,
            layoutOrder: 0,
            searched: true,
          },
        },
      ],
      edges: [],
      viewport: null,
    })

    expect(snapshot.nodes[0].data.layoutLayer).toBeUndefined()
    expect(snapshot.nodes[0].data.layoutComponentIndex).toBeUndefined()
    expect(snapshot.nodes[0].data.layoutOrder).toBeUndefined()
    expect(snapshot.nodes[0].data.searched).toBe(true)
  })
})
