import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import GraphExplorer from "@/components/Graph/GraphExplorer"
import { PageShell } from "@/components/Layout/PageShell"

const optionalYearFromUrl = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === "") {
      return undefined
    }
    const parsed = typeof value === "number" ? value : Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : undefined
  })

const graphSearchSchema = z.object({
  place: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  year_start: optionalYearFromUrl,
  year_end: optionalYearFromUrl,
  q: z.string().optional(),
})

export const Route = createFileRoute("/_layout/")({
  validateSearch: graphSearchSchema,
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
  const search = Route.useSearch()

  return (
    <PageShell className="relative">
      <GraphExplorer initialSearch={search} />
    </PageShell>
  )
}
