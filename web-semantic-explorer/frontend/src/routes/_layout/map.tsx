import { createFileRoute } from "@tanstack/react-router"

import { MapPage } from "@/pages/map"

export const Route = createFileRoute("/_layout/map")({
  component: MapPage,
  head: () => ({
    meta: [{ title: "Mapa de calor · Semantic Explorer" }],
  }),
})
