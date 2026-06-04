import type { LucideIcon } from "lucide-react"
import { Globe, Home, Users } from "lucide-react"

export type NavItem = {
  icon: LucideIcon
  title: string
  path: string
}

export const BASE_NAV_ITEMS: NavItem[] = [
  { icon: Home, title: "Buscador", path: "/" },
  { icon: Globe, title: "Mapa", path: "/map" },
]

export const ADMIN_NAV_ITEM: NavItem = {
  icon: Users,
  title: "Admin",
  path: "/admin",
}

export function getNavItems(isSuperuser?: boolean): NavItem[] {
  return isSuperuser ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS
}
