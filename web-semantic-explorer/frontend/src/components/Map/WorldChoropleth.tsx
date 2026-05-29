import type { FeatureCollection } from "geojson"
import { useEffect, useMemo, useState } from "react"

import {
  getCountryFill,
  HEATMAP_SEA_FILL,
  loadWorldCountriesGeoJson,
} from "@/lib/heatmapColors"
import {
  buildChoroplethScene,
  CHOROPLETH_OCEAN_RECT,
} from "@/lib/choroplethScene"
import { DEFAULT_PROJECTION_ID } from "@/lib/mapProjections"

import { useChoroplethZoom } from "./hooks/useChoroplethZoom"
import type { WorldChoroplethProps } from "./types"

export function WorldChoropleth({
  countryCounts,
  maxCount,
  selectedCode,
  hoveredCode,
  highlightedCodes,
  hoveredRegionCodes,
  projectionId,
  onHoverCountry,
  onSelectCountry,
}: WorldChoroplethProps) {
  const [countries, setCountries] = useState<FeatureCollection | null>(null)
  const [loadError, setLoadError] = useState(false)

  const { svgRef, transform, resetView } = useChoroplethZoom(
    countries !== null,
    projectionId,
  )

  useEffect(() => {
    let cancelled = false

    loadWorldCountriesGeoJson()
      .then((geojson) => {
        if (!cancelled) {
          setCountries(geojson)
          setLoadError(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const mapScene = useMemo(
    () => (countries ? buildChoroplethScene(countries, projectionId) : null),
    [countries, projectionId],
  )

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No se pudieron cargar las fronteras del mapa.
      </div>
    )
  }

  if (!countries || !mapScene) {
    return (
      <div className="flex h-full items-center justify-center bg-map-ocean text-sm text-muted-foreground">
        Preparando mapa…
      </div>
    )
  }

  const { items, viewBox } = mapScene
  const viewBoxStr = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`

  return (
    <div className="relative h-full w-full bg-map-ocean">
      <button
        type="button"
        onClick={resetView}
        className="absolute right-3 top-3 z-10 border-2 border-foreground bg-background px-2 py-1 text-[10px] uppercase tracking-widest shadow-[2px_2px_0_0_var(--color-foreground)] hover:bg-muted/60"
      >
        Centrar
      </button>
      <svg
        ref={svgRef}
        viewBox={viewBoxStr}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        role="img"
        aria-label="Mapa mundial de cobertura"
      >
        <g transform={transform.toString()}>
          <rect
            x={CHOROPLETH_OCEAN_RECT.x}
            y={CHOROPLETH_OCEAN_RECT.y}
            width={CHOROPLETH_OCEAN_RECT.width}
            height={CHOROPLETH_OCEAN_RECT.height}
            fill={HEATMAP_SEA_FILL}
            className="pointer-events-none"
          />
          {items.map((country) => {
            const fill = getCountryFill(
              country.isoCode,
              countryCounts,
              maxCount,
              selectedCode,
              hoveredCode,
              highlightedCodes,
              hoveredRegionCodes,
            )

            return (
              <path
                key={country.key}
                d={country.path}
                fill={fill}
                stroke="var(--map-stroke)"
                strokeWidth={0.45 / transform.k}
                style={{ cursor: country.isoCode ? "pointer" : "default" }}
                onMouseEnter={() =>
                  onHoverCountry(country.isoCode ?? null, country.name)
                }
                onMouseLeave={() => onHoverCountry(null)}
                onClick={() => onSelectCountry(country.isoCode, country.name)}
                aria-label={country.name}
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export { DEFAULT_PROJECTION_ID }
