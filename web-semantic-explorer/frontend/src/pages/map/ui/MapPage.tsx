import { PageShell } from "@/widgets/app-shell"
import { GeoHeatmap } from "@/widgets/map-explorer"

export function MapPage() {
  return (
    <PageShell>
      <GeoHeatmap />
    </PageShell>
  )
}
