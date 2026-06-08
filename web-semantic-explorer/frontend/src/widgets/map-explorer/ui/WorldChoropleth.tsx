import type { FeatureCollection } from "geojson"
import { memo, useEffect, useMemo, useState } from "react"
import { useTheme } from "@/shared/lib/theme/ThemeProvider"
import {
  buildChoroplethScene,
  CHOROPLETH_OCEAN_RECT,
  type RenderCountry,
} from "@/widgets/map-explorer/lib/choroplethScene"
import {
  getCountryFill,
  HEATMAP_SEA_FILL,
  isCountryEmphasized,
  loadWorldCountriesGeoJson,
} from "@/widgets/map-explorer/lib/heatmapColors"
import { DEFAULT_PROJECTION_ID } from "@/widgets/map-explorer/lib/mapProjections"

import { useChoroplethZoom } from "./hooks/useChoroplethZoom"
import type { WorldChoroplethProps } from "./types"

function CountryPath({
  country,
  fill,
  strokeWidth,
  pointerEvents = "auto",
  className,
}: {
  country: RenderCountry
  fill: string
  strokeWidth: number
  pointerEvents?: "auto" | "none"
  className?: string
}) {
  return (
    <path
      d={country.path}
      fill={fill}
      stroke="var(--map-stroke)"
      strokeWidth={strokeWidth}
      pointerEvents={pointerEvents}
      className={className}
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
      className="world-choropleth__country"
      aria-label={country.name}
      style={{ cursor: "pointer" }}
      onMouseEnter={() => onHoverCountry(country.isoCode ?? null, country.name)}
      onMouseLeave={() => onHoverCountry(null)}
      onClick={() => onSelectCountry(country.isoCode, country.name)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelectCountry(country.isoCode, country.name)
        }
      }}
    >
      <CountryPath
        country={country}
        fill={fill}
        strokeWidth={strokeWidth}
        className="world-choropleth__shape"
      />
    </g>
  )
}

export const WorldChoropleth = memo(function WorldChoropleth({
  countryCounts,
  maxCount,
  selectedCode,
  hoveredCode,
  highlightedCodes,
  hoveredRegionCodes,
  projectionId,
  focusCountryCode = null,
  onHoverCountry,
  onSelectCountry,
}: WorldChoroplethProps) {
  const { colorTheme, resolvedTheme } = useTheme()
  const [countries, setCountries] = useState<FeatureCollection | null>(null)
  const [loadError, setLoadError] = useState(false)

  const { svgRef, transform, resetView, zoomToBounds } = useChoroplethZoom(
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

  const countryFills = useMemo(() => {
    if (!mapScene) return null
    return mapScene.items.map((country) => ({
      key: country.key,
      fill: getCountryFill(
        country.isoCode,
        countryCounts,
        maxCount,
        selectedCode,
        hoveredCode,
        highlightedCodes,
        hoveredRegionCodes,
      ),
      emphasized: isCountryEmphasized(
        country.isoCode,
        selectedCode,
        hoveredCode,
        highlightedCodes,
        hoveredRegionCodes,
      ),
      isInteractive: Boolean(country.isoCode),
      country,
    }))
  }, [
    mapScene,
    countryCounts,
    maxCount,
    selectedCode,
    hoveredCode,
    highlightedCodes,
    hoveredRegionCodes,
    colorTheme,
    resolvedTheme,
  ])

  useEffect(() => {
    if (!focusCountryCode || !mapScene) return

    const country = mapScene.items.find(
      (item) => item.isoCode === focusCountryCode,
    )
    if (!country?.bounds) return

    zoomToBounds(country.bounds, mapScene.viewBox)
  }, [focusCountryCode, mapScene, zoomToBounds])

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No se pudieron cargar las fronteras del mapa.
      </div>
    )
  }

  if (!countries || !mapScene || !countryFills) {
    return (
      <div className="flex h-full items-center justify-center bg-map-ocean text-sm text-muted-foreground">
        Preparando mapa…
      </div>
    )
  }

  const { viewBox } = mapScene
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
        className="world-choropleth h-full w-full cursor-grab touch-none active:cursor-grabbing"
        role="img"
        aria-label="Mapa mundial de calor"
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
          {countryFills.map(
            ({ key, fill, emphasized, isInteractive, country }) => {
            const strokeWidth = emphasized ? emphasisStroke : baseStroke

            if (!isInteractive) {
              return (
                <CountryPath
                  key={key}
                  country={country}
                  fill={fill}
                  strokeWidth={strokeWidth}
                  pointerEvents="none"
                />
              )
            }

            return (
              <InteractiveCountry
                key={key}
                country={country}
                fill={fill}
                strokeWidth={strokeWidth}
                onHoverCountry={onHoverCountry}
                onSelectCountry={onSelectCountry}
              />
            )
          },
          )}
        </g>
      </svg>
    </div>
  )
})

export { DEFAULT_PROJECTION_ID }
