import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/widgets/app-shell"

export const Route = createFileRoute("/_layout")({
  component: DashboardLayout,
})
