import { Loader2, PanelRightOpen } from "lucide-react"
import { memo, useCallback, useMemo, useState } from "react"

import type { HeatmapEntry } from "@/shared/api/stats"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet"
import { getCountrySearchLabel } from "@/widgets/map-explorer/lib/countrySearchLabels"
import { resolveCountryClickSearch } from "@/widgets/map-explorer/lib/heatmapColors"
import type { MapProjectionId } from "@/widgets/map-explorer/lib/mapProjections"

import { GeoHeatmapMapTooltip } from "./GeoHeatmapMapTooltip"
import { GeoHeatmapSidebar } from "./GeoHeatmapSidebar"
import { GeoHeatmapSidebarContent } from "./GeoHeatmapSidebarContent"
import { useMapHoverState } from "./hooks/useMapHoverState"
import type { HeatmapPlaceGroups, MapPlaceFilterIntent } from "./types"
import { WorldChoropleth } from "./WorldChoropleth"

type GeoHeatmapMainProps = {
  projectionId: MapProjectionId
  focusCountryCode: string | null
  onFocusCountry: (isoCode: string) => void
  isLoading: boolean
  isError: boolean
  hasData: boolean
  countryCounts: Map<string, number>
  maxCount: number
  placeGroups: HeatmapPlaceGroups
  findDirectForCountry: (isoCode: string) => HeatmapEntry | undefined
  findRegionsForCountry: (isoCode: string) => HeatmapEntry[]
  activeWorkspaceName?: string
  isGuestMode: boolean
  onMapCountrySelect: (intent: MapPlaceFilterIntent) => void
  onAddCountryToCurrent: (entry: HeatmapEntry) => void
  onAddCountryToNew: (entry: HeatmapEntry) => void
}

export const GeoHeatmapMain = memo(function GeoHeatmapMain({
  projectionId,
  focusCountryCode,
  onFocusCountry,
  isLoading,
  isError,
  hasData,
  countryCounts,
  maxCount,
  placeGroups,
  findDirectForCountry,
  findRegionsForCountry,
  activeWorkspaceName,
  isGuestMode,
  onMapCountrySelect,
  onAddCountryToCurrent,
  onAddCountryToNew,
}: GeoHeatmapMainProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false)

  const {
    hoverState,
    goToGraphWithPlace,
    handleCountryPlaceClick,
    handleRegionPlaceClick,
    handleCountryClick,
    handleCountryHover,
    handleCountryListHover,
    handleRegionListHover,
  } = useMapHoverState({ onFocusCountry })

  const sidebarContentProps = {
    maxCount,
    placeGroups,
    hoveredCode: hoverState.hoveredCode,
    selectedCode: hoverState.selectedCode,
    hoveredRegionEntry: hoverState.hoveredRegionEntry,
    selectedRegionId: hoverState.selectedRegionId,
    activeWorkspaceName,
    isGuestMode,
    onCountryRowClick: handleCountryPlaceClick,
    onAddCountryToCurrent,
    onAddCountryToNew,
    onRegionPlaceClick: handleRegionPlaceClick,
    onCountryListHover: handleCountryListHover,
    onRegionListHover: handleRegionListHover,
    onOpenSelectedRegion: () => {
      const entry = placeGroups.regionPlaces.find(
        (e) => e.place_id === hoverState.selectedRegionId,
      )
      if (entry) goToGraphWithPlace(entry)
    },
    onUnmappedPlaceClick: goToGraphWithPlace,
  }

  const onMapCountryClick = useCallback(
    (isoCode: string | undefined, countryName?: string) => {
      handleCountryClick(isoCode, countryName)
      if (!isoCode) return

      const direct = findDirectForCountry(isoCode)
      const { place, q } = resolveCountryClickSearch(
        placeGroups.countryPlaces,
        isoCode,
        countryName,
        getCountrySearchLabel,
      )
      onMapCountrySelect({
        place,
        q,
        label: place,
        isoCode,
        placeId: direct?.place_id,
        articleCount: direct?.article_count ?? countryCounts.get(isoCode) ?? 0,
      })
    },
    [
      countryCounts,
      findDirectForCountry,
      handleCountryClick,
      onMapCountrySelect,
      placeGroups.countryPlaces,
    ],
  )

  const hoveredDirect = useMemo(() => {
    if (!hoverState.hoveredCode) return undefined
    return findDirectForCountry(hoverState.hoveredCode)
  }, [findDirectForCountry, hoverState.hoveredCode])

  const hoveredRegions = useMemo(() => {
    if (!hoverState.hoveredCode) return []
    return findRegionsForCountry(hoverState.hoveredCode)
  }, [findRegionsForCountry, hoverState.hoveredCode])

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-map-ocean lg:border-r-0">
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

        {isError && !hasData && (
          <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-sm text-muted-foreground">
            No se pudo cargar el mapa.
          </div>
        )}

        {hasData && (
          <WorldChoropleth
            countryCounts={countryCounts}
            maxCount={maxCount}
            selectedCode={hoverState.selectedCode}
            hoveredCode={hoverState.hoveredCode}
            highlightedCodes={hoverState.highlightedCodes}
            hoveredRegionCodes={hoverState.hoveredRegionCodes}
            focusCountryCode={focusCountryCode}
            projectionId={projectionId}
            onHoverCountry={handleCountryHover}
            onSelectCountry={onMapCountryClick}
          />
        )}

        <GeoHeatmapMapTooltip
          hoveredCode={hoverState.hoveredCode}
          hoveredName={hoverState.hoveredName}
          hoveredRegionEntry={hoverState.hoveredRegionEntry}
          countryCounts={countryCounts}
          hoveredDirect={hoveredDirect}
          hoveredRegions={hoveredRegions}
        />

        <button
          type="button"
          className="map-sidebar-toggle lg:hidden"
          aria-expanded={mobileSidebarOpen}
          aria-controls="map-sidebar-mobile"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <PanelRightOpen className="h-3.5 w-3.5" aria-hidden />
          Panel
        </button>

        {desktopSidebarCollapsed && (
          <button
            type="button"
            className="map-sidebar-toggle map-sidebar-toggle--desktop hidden lg:inline-flex"
            aria-expanded={false}
            onClick={() => setDesktopSidebarCollapsed(false)}
          >
            <PanelRightOpen className="h-3.5 w-3.5" aria-hidden />
            Panel
          </button>
        )}
      </div>

      <GeoHeatmapSidebar
        collapsed={desktopSidebarCollapsed}
        onCollapse={() => setDesktopSidebarCollapsed(true)}
        {...sidebarContentProps}
      />

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          id="map-sidebar-mobile"
          side="right"
          className="map-sidebar-sheet"
        >
          <SheetHeader className="map-sidebar-sheet__header">
            <SheetTitle className="map-sidebar-sheet__title">
              Panel del mapa
            </SheetTitle>
            <SheetDescription className="sr-only">
              Leyenda, países y macro-regiones del mapa de calor.
            </SheetDescription>
          </SheetHeader>
          <div className="map-sidebar-sheet__body">
            <GeoHeatmapSidebarContent {...sidebarContentProps} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
})
