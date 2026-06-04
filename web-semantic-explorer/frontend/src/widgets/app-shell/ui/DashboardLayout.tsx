import { Outlet } from "@tanstack/react-router"

import { Footer } from "@/shared/ui/footer/Footer"
import "./styles/index.css"
import { TopNavBar } from "./TopNavBar"

export function DashboardLayout() {
  return (
    <div className="flex h-svh w-full flex-col overflow-hidden bg-background">
      <TopNavBar />
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  )
}
