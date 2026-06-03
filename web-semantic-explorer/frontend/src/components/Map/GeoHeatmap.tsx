import { Loader2 } from "lucide-react"
import { useMemo, useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DEFAULT_PROJECTION_ID,
  MAP_PROJECTIONS,
  type MapProjectionId,
} from "@/lib/mapProjections"

import { GeoHeatmapMapTooltip } from "./GeoHeatmapMapTooltip"
import { GeoHeatmapSidebar } from "./GeoHeatmapSidebar"
import { useHeatmapData } from "./hooks/useHeatmapData"
import { useMapHoverState } from "./hooks/useMapHoverState"
import { WorldChoropleth } from "./WorldChoropleth"

export function GeoHeatmap() {
  const [projectionId, setProjectionId] = useState<MapProjectionId>(
    DEFAULT_PROJECTION_ID,
  )

  const {
    data,
    isLoading,
    isError,
    entries,
    countryCounts,
    maxCount,
    placeGroups,
    findDirectForCountry,
    findRegionsForCountry,
  } = useHeatmapData()

  const {
    hoverState,
    goToGraphWithPlace,
    handleCountryPlaceClick,
    handleRegionPlaceClick,
    handleCountryClick,
    handleCountryHover,
    handleRegionListHover,
  } = useMapHoverState({ entries })

  const activeProjection = MAP_PROJECTIONS.find((p) => p.id === projectionId)

  const hoveredDirect = useMemo(() => {
    if (!hoverState.hoveredCode) return undefined
    return findDirectForCountry(hoverState.hoveredCode)
  }, [findDirectForCountry, hoverState.hoveredCode])

  const hoveredRegions = useMemo(() => {
    if (!hoverState.hoveredCode) return []
    return findRegionsForCountry(hoverState.hoveredCode)
  }, [findRegionsForCountry, hoverState.hoveredCode])

  const openSelectedRegion = () => {
    const entry = placeGroups.regionPlaces.find(
      (e) => e.place_id === hoverState.selectedRegionId,
    )
    if (entry) goToGraphWithPlace(entry)
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-background">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground bg-background px-6 py-4 shadow-[0_4px_0_0_var(--color-foreground)]">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
            Fase 3 · visión geoespacial
          </p>
          <h1 className="font-sans text-2xl font-bold">Mapa de cobertura</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Intensidad por volumen de artículos. Rueda del ratón para zoom,
            arrastra para mover. Clic en cualquier país abre búsqueda semántica
            con ese país (aunque no tenga artículos en EOM).
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Proyección
            </p>
            <Select
              value={projectionId}
              onValueChange={(value) =>
                setProjectionId(value as MapProjectionId)
              }
            >
              <SelectTrigger className="w-[220px] rounded-none border-2 border-foreground">
                <SelectValue placeholder="Proyección" />
              </SelectTrigger>
              <SelectContent>
                {MAP_PROJECTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeProjection && (
              <p className="max-w-[220px] text-[10px] text-muted-foreground">
                {projectionId === "mercator"
                  ? "Clásica para navegación."
                  : "Buen equilibrio área y forma."}
              </p>
            )}
          </div>

          {data && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Artículos geolocalizados
              </p>
              <p className="font-mono text-2xl font-bold">
                {data.total_articles}
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="relative min-h-[min(50vh,360px)] min-w-0 flex-1 overflow-hidden border-b-2 border-foreground bg-map-ocean lg:min-h-0 lg:border-b-0 lg:border-r-2">
          {isLoading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/70 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Cargando mapa…
            </div>
          )}

          {isError && !data && (
            <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-sm text-muted-foreground">
              No se pudo cargar el mapa.
            </div>
          )}

          {data && (
            <WorldChoropleth
              countryCounts={countryCounts}
              maxCount={maxCount}
              selectedCode={hoverState.selectedCode}
              hoveredCode={hoverState.hoveredCode}
              highlightedCodes={hoverState.highlightedCodes}
              hoveredRegionCodes={hoverState.hoveredRegionCodes}
              projectionId={projectionId}
              onHoverCountry={handleCountryHover}
              onSelectCountry={handleCountryClick}
            />
          )}

          <GeoHeatmapMapTooltip
            hoverState={hoverState}
            countryCounts={countryCounts}
            hoveredDirect={hoveredDirect}
            hoveredRegions={hoveredRegions}
          />
        </div>

        <GeoHeatmapSidebar
          maxCount={maxCount}
          placeGroups={placeGroups}
          hoverState={hoverState}
          onCountryPlaceClick={handleCountryPlaceClick}
          onRegionPlaceClick={handleRegionPlaceClick}
          onRegionListHover={handleRegionListHover}
          onOpenSelectedRegion={openSelectedRegion}
          onUnmappedPlaceClick={goToGraphWithPlace}
        />
      </div>
    </div>
  )
}
