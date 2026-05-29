import type { HeatmapEntry } from "@/api/stats"
import type { MapProjectionId } from "@/lib/mapProjections"

export type {
  ChoroplethScene,
  ChoroplethViewBox,
  RenderCountry,
} from "@/lib/choroplethScene"

export type MapHoverState = {
  hoveredCode: string | null
  hoveredName: string | null
  selectedCode: string | null
  highlightedCodes: Set<string> | null
  hoveredRegionCodes: Set<string> | null
  hoveredRegionEntry: HeatmapEntry | null
  selectedRegionId: number | null
}

export type WorldChoroplethProps = {
  countryCounts: Map<string, number>
  maxCount: number
  selectedCode: string | null
  hoveredCode: string | null
  highlightedCodes: Set<string> | null
  hoveredRegionCodes: Set<string> | null
  projectionId: MapProjectionId
  onHoverCountry: (isoCode: string | null, name?: string) => void
  onSelectCountry: (isoCode: string | undefined, name?: string) => void
}

export type HeatmapPlaceGroups = {
  countryPlaces: HeatmapEntry[]
  regionPlaces: HeatmapEntry[]
  unmappedPlaces: HeatmapEntry[]
}
