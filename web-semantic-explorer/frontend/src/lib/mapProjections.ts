import type { GeoProjection } from "d3-geo"
import { geoMercator } from "d3-geo"
import { geoWinkel3 } from "d3-geo-projection"

export type MapProjectionId = "mercator" | "winkel"

export type MapProjectionOption = {
  id: MapProjectionId
  label: string
  factory: () => GeoProjection
}

export const MAP_PROJECTIONS: MapProjectionOption[] = [
  {
    id: "mercator",
    label: "Mercator",
    factory: () => geoMercator(),
  },
  {
    id: "winkel",
    label: "Winkel Tripel",
    factory: () => geoWinkel3(),
  },
]

export const DEFAULT_PROJECTION_ID: MapProjectionId = "winkel"

export function getProjectionOption(id: MapProjectionId) {
  return (
    MAP_PROJECTIONS.find((option) => option.id === id) ?? MAP_PROJECTIONS[1]
  )
}
