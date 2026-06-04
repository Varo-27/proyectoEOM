import { PageShell } from "@/widgets/app-shell"
import { GraphExplorer } from "@/widgets/graph-explorer"

export function GraphPage() {
  return (
    <PageShell className="relative">
      <GraphExplorer />
    </PageShell>
  )
}
