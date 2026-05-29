import { describe, expect, it } from "vitest"

import {
  emptyFilters,
  filtersToApiQuery,
  filtersToSearchParams,
  hasActiveFilters,
  searchParamsToFilters,
} from "./filters"

describe("filters helpers", () => {
  it("emptyFilters devuelve objeto vacío", () => {
    expect(emptyFilters()).toEqual({})
  })

  it("hasActiveFilters detecta filtros presentes", () => {
    expect(hasActiveFilters({})).toBe(false)
    expect(hasActiveFilters({ place: "Madrid" })).toBe(true)
    expect(hasActiveFilters({ year_start: 2020 })).toBe(true)
  })

  it("filtersToApiQuery omite valores vacíos", () => {
    expect(
      filtersToApiQuery({
        place: "  Barcelona ",
        category: "",
        author: "García",
        year_start: 2018,
        year_end: 2024,
      }),
    ).toEqual({
      place: "Barcelona",
      author: "García",
      year_start: 2018,
      year_end: 2024,
    })
  })

  it("filtersToSearchParams serializa años como string", () => {
    expect(
      filtersToSearchParams(
        { place: "Valencia", year_start: 2015, year_end: 2020 },
        "historia",
      ),
    ).toEqual({
      q: "historia",
      place: "Valencia",
      year_start: "2015",
      year_end: "2020",
    })
  })

  it("searchParamsToFilters parsea años desde URL", () => {
    expect(
      searchParamsToFilters({
        place: "Sevilla",
        category: "Cultura",
        year_start: "2010",
        year_end: "2022",
      }),
    ).toEqual({
      place: "Sevilla",
      category: "Cultura",
      year_start: 2010,
      year_end: 2022,
    })
  })
})
