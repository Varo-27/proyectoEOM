import type { FeatureCollection } from "geojson"
import { useEffect, useMemo, useState } from "react"
import {
  buildChoroplethScene,
  CHOROPLETH_OCEAN_RECT,
  type RenderCountry,
} from "@/lib/choroplethScene"
import {
  getCountryBaseFill,
  getCountryFill,
  HEATMAP_SEA_FILL,
  isCountryEmphasized,
  loadWorldCountriesGeoJson,
} from "@/lib/heatmapColors"
import { DEFAULT_PROJECTION_ID } from "@/lib/mapProjections"

import { useChoroplethZoom } from "./hooks/useChoroplethZoom"
import type { WorldChoroplethProps } from "./types"

function CountryPath({
  country,
  fill,
  strokeWidth,
  pointerEvents = "auto",
}: {
  country: RenderCountry
  fill: string
  strokeWidth: number
  pointerEvents?: "auto" | "none"
}) {
  return (
    <path
      d={country.path}
      fill={fill}
      stroke="var(--map-stroke)"
      strokeWidth={strokeWidth}
      pointerEvents={pointerEvents}
    />
  )
}

function InteractiveCountry({
  country,
  fill,
  strokeWidth,
  onHoverCountry,
  onSelectCountry,
}: {
  country: RenderCountry
  fill: string
  strokeWidth: number
  onHoverCountry: WorldChoroplethProps["onHoverCountry"]
  onSelectCountry: WorldChoroplethProps["onSelectCountry"]
}) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={country.name}
      style={{ cursor: "pointer" }}
      onMouseEnter={() =>
        onHoverCountry(country.isoCode ?? null, country.name)
      }
      onMouseLeave={() => onHoverCountry(null)}
      onClick={() => onSelectCountry(country.isoCode, country.name)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelectCountry(country.isoCode, country.name)
        }
      }}
    >
      <CountryPath country={country} fill={fill} strokeWidth={strokeWidth} />
    </g>
  )
}

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

  const emphasizedItems = useMemo(() => {
    if (!mapScene) return []
    return mapScene.items.filter((country) =>
      isCountryEmphasized(
        country.isoCode,
        selectedCode,
        hoveredCode,
        highlightedCodes,
        hoveredRegionCodes,
      ),
    )
  }, [
    mapScene,
    selectedCode,
    hoveredCode,
    highlightedCodes,
    hoveredRegionCodes,
  ])

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
  const baseStroke = 0.45 / transform.k
  const emphasisStroke = 0.9 / transform.k

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
            const fill = getCountryBaseFill(
              country.isoCode,
              countryCounts,
              maxCount,
            )
            const isInteractive = Boolean(country.isoCode)

            if (!isInteractive) {
              return (
                <CountryPath
                  key={country.key}
                  country={country}
                  fill={fill}
                  strokeWidth={baseStroke}
                  pointerEvents="none"
                />
              )
            }

            return (
              <InteractiveCountry
                key={country.key}
                country={country}
                fill={fill}
                strokeWidth={baseStroke}
                onHoverCountry={onHoverCountry}
                onSelectCountry={onSelectCountry}
              />
            )
          })}
          <g aria-hidden pointerEvents="none">
            {emphasizedItems.map((country) => (
              <CountryPath
                key={`emphasis-${country.key}`}
                country={country}
                fill={getCountryFill(
                  country.isoCode,
                  countryCounts,
                  maxCount,
                  selectedCode,
                  hoveredCode,
                  highlightedCodes,
                  hoveredRegionCodes,
                )}
                strokeWidth={emphasisStroke}
                pointerEvents="none"
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  )
}

export { DEFAULT_PROJECTION_ID }
