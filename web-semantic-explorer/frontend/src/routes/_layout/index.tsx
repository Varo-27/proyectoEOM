import { createFileRoute } from "@tanstack/react-router"

import GraphExplorer from "@/components/Graph/GraphExplorer"
import { PageShell } from "@/components/Layout/PageShell"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Semantic Graph Explorer",
      },
    ],
  }),
})

function Dashboard() {
  return (
    <PageShell className="relative">
      <GraphExplorer />
    </PageShell>
  )
}
