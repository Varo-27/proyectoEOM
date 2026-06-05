import { describe, expect, it } from "vitest"

import { getStarFill, ratingFromPointerRatio } from "./starFill"

describe("starFill", () => {
  it("calcula medias estrellas", () => {
    expect(getStarFill(0, 0.5)).toBe("half")
    expect(getStarFill(0, 1)).toBe("full")
    expect(getStarFill(1, 1.5)).toBe("half")
    expect(getStarFill(2, 2)).toBe("empty")
  })

  it("mapea posición del puntero a medias estrellas", () => {
    expect(ratingFromPointerRatio(0.1, 5)).toBe(0.5)
    expect(ratingFromPointerRatio(0.2, 5)).toBe(1)
    expect(ratingFromPointerRatio(0.5, 5)).toBe(2.5)
    expect(ratingFromPointerRatio(1, 5)).toBe(5)
  })
})
