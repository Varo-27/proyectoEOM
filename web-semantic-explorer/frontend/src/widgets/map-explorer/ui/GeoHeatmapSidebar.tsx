import { Globe2, MapPin } from "lucide-react"

import type { HeatmapEntry } from "@/shared/api/stats"
import { Badge } from "@/shared/ui/badge"
import {
  EOM_GREEN,
  EOM_GREEN_LEGEND_STEPS,
  getHeatmapColorForCount,
} from "@/widgets/map-explorer/lib/heatmapColors"

import type { HeatmapPlaceGroups, MapHoverState } from "./types"

type GeoHeatmapSidebarProps = {
  maxCount: number
  placeGroups: HeatmapPlaceGroups
  hoverState: MapHoverState
  onCountryPlaceClick: (entry: HeatmapEntry) => void
  onRegionPlaceClick: (entry: HeatmapEntry) => void
  onRegionListHover: (entry: HeatmapEntry | null) => void
  onOpenSelectedRegion: () => void
  onUnmappedPlaceClick: (entry: HeatmapEntry) => void
}

export function GeoHeatmapSidebar({
  maxCount,
  placeGroups,
  hoverState,
  onCountryPlaceClick,
  onRegionPlaceClick,
  onRegionListHover,
  onOpenSelectedRegion,
  onUnmappedPlaceClick,
}: GeoHeatmapSidebarProps) {
  const { countryPlaces, regionPlaces, unmappedPlaces } = placeGroups
  const { selectedRegionId } = hoverState

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t-2 border-foreground bg-map-panel p-4 lg:w-80 lg:max-w-[min(20rem,40vw)] lg:border-t-0 lg:border-l-2">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Globe2 className="h-3.5 w-3.5" />
        Leyenda · EOM
      </div>
      <div
        className="h-4 w-full overflow-hidden rounded-sm border border-foreground/40"
        style={{
          background: `linear-gradient(90deg, var(--map-ocean) 0%, ${EOM_GREEN[50]} 8%, ${EOM_GREEN[100]} 18%, ${EOM_GREEN[300]} 35%, ${EOM_GREEN[500]} 52%, ${EOM_GREEN[700]} 72%, ${EOM_GREEN[950]} 100%)`,
        }}
      />
      <ul className="grid grid-cols-3 gap-1.5">
        {EOM_GREEN_LEGEND_STEPS.map((step) => (
          <li
            key={String(step.key)}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
          >
            <span
              className={`h-3 w-3 shrink-0 border border-foreground/25 ${
                step.key === "ocean" ? "bg-map-ocean" : ""
              }`}
              style={
                step.key === "ocean" || step.key === "empty"
                  ? step.key === "empty"
                    ? { backgroundColor: EOM_GREEN[50] }
                    : undefined
                  : { backgroundColor: EOM_GREEN[step.key] }
              }
            />
            <span className="leading-tight">{step.label}</span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-muted-foreground">
        Mar = gris EOM. País sin artículos = verde pálido (#ebf2e3). Verde =
        hover de país. Ámbar claro = hover de macro-región en la lista. Dorado =
        macro-región seleccionada con clic.
      </p>

      <div className="max-h-52 space-y-1 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Países ({countryPlaces.length})
        </p>
        <ul className="space-y-0.5">
          {[...countryPlaces]
            .sort((a, b) => b.article_count - a.article_count)
            .map((entry) => {
              const swatchColor = getHeatmapColorForCount(
                entry.article_count,
                maxCount,
              )
              return (
                <li key={entry.place_id}>
                  <button
                    type="button"
                    onClick={() => onCountryPlaceClick(entry)}
                    className="flex w-full items-center gap-2 border border-transparent px-2 py-1 text-left text-sm transition-colors hover:border-foreground hover:bg-accent"
                  >
                    <span
                      className="h-4 w-4 shrink-0 border border-foreground/30"
                      style={{ backgroundColor: swatchColor }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {entry.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {entry.article_count}
                    </span>
                  </button>
                </li>
              )
            })}
        </ul>
      </div>

      {regionPlaces.length > 0 && (
        <div className="max-h-40 space-y-1 overflow-y-auto border-t border-foreground/20 pt-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Macro-regiones ({regionPlaces.length})
          </p>
          <ul className="space-y-0.5">
            {regionPlaces.map((entry) => (
              <li key={entry.place_id}>
                <button
                  type="button"
                  onClick={() => onRegionPlaceClick(entry)}
                  onMouseEnter={() => onRegionListHover(entry)}
                  onMouseLeave={() => onRegionListHover(null)}
                  className={`flex w-full items-center gap-2 border px-2 py-1 text-left text-sm transition-colors hover:border-foreground hover:bg-accent ${
                    selectedRegionId === entry.place_id
                      ? "border-chart-4 bg-chart-4/15"
                      : "border-transparent"
                  }`}
                >
                  <span
                    className="h-4 w-4 shrink-0 border border-foreground/30 bg-chart-4"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {entry.name}
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      ({entry.map_country_codes.length} países)
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {entry.article_count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {selectedRegionId && (
            <button
              type="button"
              className="w-full border border-foreground px-2 py-1 text-xs hover:bg-muted/60"
              onClick={onOpenSelectedRegion}
            >
              Abrir grafo con esta región
            </button>
          )}
        </div>
      )}

      {unmappedPlaces.length > 0 && (
        <div className="space-y-2 border-t-2 border-foreground pt-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Sin mapa ({unmappedPlaces.length})
          </div>
          <p className="text-[10px] text-muted-foreground">
            Mundo, polos y ártico editorial (sin país ISO único).
          </p>
          <div className="flex flex-wrap gap-2">
            {unmappedPlaces.map((entry) => (
              <Badge
                key={entry.place_id}
                asChild
                variant="outline"
                className="cursor-pointer rounded-none border-foreground"
              >
                <button
                  type="button"
                  onClick={() => onUnmappedPlaceClick(entry)}
                >
                  {entry.name} ({entry.article_count})
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
