import { createFileRoute } from "@tanstack/react-router"
import GraphExplorer from "@/components/Graph/GraphExplorer"

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
    <div className="w-full h-full relative">
      <GraphExplorer />
    </div>
  )
}
