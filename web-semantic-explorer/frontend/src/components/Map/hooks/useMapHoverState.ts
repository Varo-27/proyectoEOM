import { useNavigate } from "@tanstack/react-router"
import { useCallback, useState } from "react"

import type { HeatmapEntry } from "@/api/stats"
import { getCountrySearchLabel } from "@/lib/countrySearchLabels"
import { resolveCountryClickSearch } from "@/lib/heatmapColors"

import type { MapHoverState } from "../types"

type UseMapHoverStateOptions = {
  entries: HeatmapEntry[]
}

export function useMapHoverState({ entries }: UseMapHoverStateOptions) {
  const navigate = useNavigate()

  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [highlightedCodes, setHighlightedCodes] = useState<Set<string> | null>(
    null,
  )
  const [hoveredRegionCodes, setHoveredRegionCodes] =
    useState<Set<string> | null>(null)
  const [hoveredRegionEntry, setHoveredRegionEntry] =
    useState<HeatmapEntry | null>(null)
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)

  const goToGraphWithPlace = useCallback(
    (entry: HeatmapEntry) => {
      navigate({
        to: "/",
        search: { place: entry.name, q: entry.name },
      })
    },
    [navigate],
  )

  const handleCountryPlaceClick = useCallback(
    (entry: HeatmapEntry) => {
      setHighlightedCodes(null)
      setSelectedRegionId(null)
      goToGraphWithPlace(entry)
    },
    [goToGraphWithPlace],
  )

  const handleRegionPlaceClick = useCallback((entry: HeatmapEntry) => {
    setHoveredRegionCodes(null)
    setHoveredRegionEntry(null)
    setHighlightedCodes(new Set(entry.map_country_codes))
    setSelectedRegionId(entry.place_id)
  }, [])

  const handleCountryClick = useCallback(
    (isoCode: string | undefined, countryName?: string) => {
      if (!isoCode) return
      setSelectedCode(isoCode)
      setHighlightedCodes(null)
      setSelectedRegionId(null)

      const { place, q } = resolveCountryClickSearch(
        entries,
        isoCode,
        countryName,
        getCountrySearchLabel,
      )
      navigate({ to: "/", search: { place, q } })
    },
    [entries, navigate],
  )

  const handleCountryHover = useCallback(
    (isoCode: string | null, name?: string) => {
      setHoveredCode(isoCode)
      setHoveredName(name ?? null)
      if (isoCode) {
        setHoveredRegionCodes(null)
        setHoveredRegionEntry(null)
      }
    },
    [],
  )

  const handleRegionListHover = useCallback(
    (entry: HeatmapEntry | null) => {
      if (!entry) {
        setHoveredRegionCodes(null)
        setHoveredRegionEntry(null)
        if (!hoveredCode) setHoveredName(null)
        return
      }
      setHoveredRegionEntry(entry)
      setHoveredRegionCodes(new Set(entry.map_country_codes))
      setHoveredName(entry.name)
      setHoveredCode(null)
    },
    [hoveredCode],
  )

  const hoverState: MapHoverState = {
    hoveredCode,
    hoveredName,
    selectedCode,
    highlightedCodes,
    hoveredRegionCodes,
    hoveredRegionEntry,
    selectedRegionId,
  }

  return {
    hoverState,
    goToGraphWithPlace,
    handleCountryPlaceClick,
    handleRegionPlaceClick,
    handleCountryClick,
    handleCountryHover,
    handleRegionListHover,
  }
}
