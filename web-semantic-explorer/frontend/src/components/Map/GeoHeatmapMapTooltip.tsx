import type { HeatmapEntry } from "@/api/stats"
import { getCountrySearchLabel } from "@/lib/countrySearchLabels"

import type { MapHoverState } from "./types"

type GeoHeatmapMapTooltipProps = {
  hoverState: MapHoverState
  countryCounts: Map<string, number>
  hoveredDirect?: HeatmapEntry
  hoveredRegions: HeatmapEntry[]
}

export function GeoHeatmapMapTooltip({
  hoverState,
  countryCounts,
  hoveredDirect,
  hoveredRegions,
}: GeoHeatmapMapTooltipProps) {
  const {
    hoveredCode,
    hoveredName,
    hoveredRegionEntry,
  } = hoverState

  const visible =
    hoveredDirect ||
    hoveredRegions.length > 0 ||
    hoveredName ||
    hoveredRegionEntry

  if (!visible) return null

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-20 max-w-xs border-2 border-foreground bg-background px-3 py-2 shadow-[4px_4px_0_0_var(--color-foreground)]">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {hoveredRegionEntry
          ? `Macro-región · ${hoveredRegionEntry.name}`
          : (hoveredName ?? hoveredCode)}
      </p>
      {hoveredRegionEntry && (
        <>
          <p className="font-mono text-lg font-bold">
            {hoveredRegionEntry.article_count} artículos (región)
          </p>
          <p className="text-xs text-muted-foreground">
            {hoveredRegionEntry.map_country_codes.length} países resaltados en
            el mapa
          </p>
        </>
      )}
      {hoveredCode && !hoveredRegionEntry && (
        <>
          <p className="font-mono text-lg font-bold">
            {countryCounts.get(hoveredCode) ?? 0} artículos (país)
          </p>
          {(countryCounts.get(hoveredCode) ?? 0) === 0 && (
            <p className="text-xs text-muted-foreground">
              Clic →{" "}
              {getCountrySearchLabel(hoveredCode, hoveredName ?? undefined)}
            </p>
          )}
        </>
      )}
      {hoveredRegions.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          {hoveredRegions.map((entry) => (
            <li key={entry.place_id}>
              + {entry.name}: {entry.article_count}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
