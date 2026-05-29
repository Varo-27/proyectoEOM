import { describe, expect, it } from "vitest"

import { dedupeEdgesById } from "./graphMappers"

describe("dedupeEdgesById", () => {
  it("elimina aristas duplicadas por id conservando la primera", () => {
    const edges = [
      { id: "a", source: "1", target: "2" },
      { id: "b", source: "1", target: "3" },
      { id: "a", source: "9", target: "9" },
    ]

    expect(dedupeEdgesById(edges)).toEqual([
      { id: "a", source: "1", target: "2" },
      { id: "b", source: "1", target: "3" },
    ])
  })

  it("devuelve array vacío sin entradas", () => {
    expect(dedupeEdgesById([])).toEqual([])
  })
})
