import { describe, expect, it } from "vitest"

import {
  buildCountryCounts,
  clipFranceMetropolitan,
  getMaxCount,
  isOverseasFrancePolygon,
} from "@/lib/heatmapColors"

describe("isOverseasFrancePolygon", () => {
  it("detecta la Guayana Francesa (longitud oeste)", () => {
    const guyaneRing: [number, number][] = [
      [-54, 5],
      [-52, 5],
      [-52, 2],
      [-54, 2],
      [-54, 5],
    ]
    expect(isOverseasFrancePolygon(guyaneRing)).toBe(true)
  })

  it("conserva la Francia metropolitana", () => {
    const metroRing: [number, number][] = [
      [-4, 48],
      [8, 48],
      [8, 42],
      [-4, 42],
      [-4, 48],
    ]
    expect(isOverseasFrancePolygon(metroRing)).toBe(false)
  })
})

describe("clipFranceMetropolitan", () => {
  it("elimina el polígono sudamericano de FRA", () => {
    const feature: GeoJSON.Feature = {
      type: "Feature",
      properties: { ISO_A3: "-99", ADM0_A3: "FRA", NAME: "France" },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [-54, 5],
              [-52, 5],
              [-52, 2],
              [-54, 2],
              [-54, 5],
            ],
          ],
          [
            [
              [-4, 48],
              [8, 48],
              [8, 42],
              [-4, 42],
              [-4, 48],
            ],
          ],
        ],
      },
    }

    const clipped = clipFranceMetropolitan(feature)
    expect(clipped.geometry?.type).toBe("Polygon")
    const ring = (clipped.geometry as GeoJSON.Polygon).coordinates[0]
    expect(isOverseasFrancePolygon(ring as [number, number][])).toBe(false)
  })
})

describe("buildCountryCounts", () => {
  it("agrega artículos por código de país directo", () => {
    const counts = buildCountryCounts([
      { country_code: "ES", article_count: 10 },
      { country_code: "ES", article_count: 5 },
      { country_code: "FR", article_count: 3 },
    ])

    expect(counts.get("ES")).toBe(15)
    expect(counts.get("FR")).toBe(3)
  })

  it("ignora entradas regionales con map_country_codes múltiples", () => {
    const counts = buildCountryCounts([
      {
        country_code: null,
        map_country_codes: ["ES", "PT"],
        article_count: 20,
      },
      { country_code: "ES", article_count: 4 },
    ])

    expect(counts.get("ES")).toBe(4)
    expect(counts.has("PT")).toBe(false)
  })
})

describe("getMaxCount", () => {
  it("devuelve el máximo valor del mapa", () => {
    const counts = new Map([
      ["ES", 10],
      ["FR", 25],
      ["DE", 5],
    ])

    expect(getMaxCount(counts)).toBe(25)
  })

  it("devuelve 0 para mapa vacío", () => {
    expect(getMaxCount(new Map())).toBe(0)
  })
})
