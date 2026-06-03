import { geoPath } from "d3-geo"
import type { FeatureCollection } from "geojson"

import { getCountrySearchLabel } from "@/lib/countrySearchLabels"
import { getGeoIsoCode } from "@/lib/heatmapColors"
import { getProjectionOption, type MapProjectionId } from "@/lib/mapProjections"

export type RenderCountry = {
  key: string
  path: string
  isoCode?: string
  name?: string
}

export type ChoroplethViewBox = {
  x: number
  y: number
  width: number
  height: number
}

export type ChoroplethScene = {
  items: RenderCountry[]
  viewBox: ChoroplethViewBox
}

type CountryFeature = GeoJSON.Feature<
  GeoJSON.Geometry,
  Record<string, string | number | undefined | null>
>

/** Tamaño de trabajo; el viewBox real se ajusta al bounding box del mapa. */
export const CHOROPLETH_LAYOUT = {
  width: 960,
  height: 480,
  padding: 12,
  viewBoxPad: 6,
} as const

/** Fondo infinito para que al hacer pan no se vea blanco. */
export const CHOROPLETH_OCEAN_RECT = {
  x: -4000,
  y: -2000,
  width: 8000,
  height: 4000,
} as const

export function buildChoroplethScene(
  countries: FeatureCollection,
  projectionId: MapProjectionId,
): ChoroplethScene {
  const { width, height, padding, viewBoxPad } = CHOROPLETH_LAYOUT
  const projection = getProjectionOption(projectionId).factory()
  const features = countries.features as CountryFeature[]

  const featuresForFit = features.filter(
    (feature) => getGeoIsoCode({ properties: feature.properties }) !== "ATA",
  )
  const fitTarget: FeatureCollection = {
    type: "FeatureCollection",
    features: featuresForFit.length > 0 ? featuresForFit : features,
  }

  projection.fitExtent(
    [
      [padding, padding],
      [width - padding, height - padding],
    ],
    fitTarget,
  )

  const generator = geoPath(projection)
  const [[x0, y0], [x1, y1]] = generator.bounds(fitTarget)

  const items: RenderCountry[] = []
  for (const [index, geoFeature] of features.entries()) {
    const path = generator(geoFeature)
    if (!path) continue

    const isoCode = getGeoIsoCode({ properties: geoFeature.properties })
    const adminName =
      typeof geoFeature.properties?.NAME === "string"
        ? geoFeature.properties.NAME
        : typeof geoFeature.properties?.ADMIN === "string"
          ? geoFeature.properties.ADMIN
          : undefined
    const name = isoCode
      ? getCountrySearchLabel(isoCode, adminName)
      : adminName

    items.push({
      key: `country-${index}`,
      path,
      isoCode,
      name,
    })
  }

  return {
    items,
    viewBox: {
      x: x0 - viewBoxPad,
      y: y0 - viewBoxPad,
      width: x1 - x0 + viewBoxPad * 2,
      height: y1 - y0 + viewBoxPad * 2,
    },
  }
}
