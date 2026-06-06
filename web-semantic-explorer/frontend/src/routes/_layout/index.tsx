import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { GraphPage } from "@/pages/graph"

const graphSearchSchema = z.object({
  q: z.string().optional(),
  place: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  year_start: z.union([z.string(), z.number()]).optional(),
  year_end: z.union([z.string(), z.number()]).optional(),
})

export const Route = createFileRoute("/_layout/")({
  validateSearch: graphSearchSchema,
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Gnosis graph",
      },
    ],
  }),
})

function Dashboard() {
  return <GraphPage />
}
