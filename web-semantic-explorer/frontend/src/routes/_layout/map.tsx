import { createFileRoute } from "@tanstack/react-router"
import { PageShell } from "@/components/Layout/PageShell"
import { GeoHeatmap } from "@/components/Map/GeoHeatmap"

export const Route = createFileRoute("/_layout/map")({
  component: MapPage,
  head: () => ({
    meta: [{ title: "Mapa de cobertura · Semantic Explorer" }],
  }),
})

function MapPage() {
  return (
    <PageShell>
      <GeoHeatmap />
    </PageShell>
  )
}
