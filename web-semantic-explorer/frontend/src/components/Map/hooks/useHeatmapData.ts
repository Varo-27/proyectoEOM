import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { StatsApi } from "@/api/stats"
import {
  buildCountryCounts,
  findDirectEntryForCountry,
  findRegionEntriesForCountry,
  getMaxCount,
  isRegionEntry,
} from "@/lib/heatmapColors"
import { enrichHeatmapResponse } from "@/lib/placeGeoResolve"
import { fetchHeatmapMock } from "@/mocks/heatmap.mock"

import type { HeatmapPlaceGroups } from "../types"

async function fetchHeatmap() {
  try {
    const data = await StatsApi.getHeatmap()
    return enrichHeatmapResponse(data)
  } catch {
    const mock = await fetchHeatmapMock()
    return enrichHeatmapResponse(mock)
  }
}

export function useHeatmapData() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["heatmap"],
    queryFn: fetchHeatmap,
  })

  const entries = data?.entries ?? []

  const countryCounts = useMemo(() => buildCountryCounts(entries), [entries])
  const maxCount = useMemo(() => getMaxCount(countryCounts), [countryCounts])

  const placeGroups = useMemo<HeatmapPlaceGroups>(() => {
    const countryPlaces = entries.filter(
      (entry) => entry.map_country_codes.length === 1,
    )
    const regionPlaces = entries.filter((entry) => isRegionEntry(entry))
    const unmappedPlaces = entries.filter(
      (entry) => entry.map_country_codes.length === 0,
    )
    return { countryPlaces, regionPlaces, unmappedPlaces }
  }, [entries])

  return {
    data,
    isLoading,
    isError,
    entries,
    countryCounts,
    maxCount,
    placeGroups,
    findDirectForCountry: (isoCode: string) =>
      findDirectEntryForCountry(entries, isoCode),
    findRegionsForCountry: (isoCode: string) =>
      findRegionEntriesForCountry(entries, isoCode),
  }
}
