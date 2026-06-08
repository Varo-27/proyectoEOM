import type { LucideIcon } from "lucide-react"
import { Globe, Home, Star, Users } from "lucide-react"

export type NavItem = {
  icon: LucideIcon
  title: string
  path: string
}

export const BASE_NAV_ITEMS: NavItem[] = [
  { icon: Home, title: "Buscador", path: "/" },
  { icon: Globe, title: "Mapa", path: "/map" },
  { icon: Star, title: "Favoritos", path: "/favorites" },
]

export const ADMIN_NAV_ITEM: NavItem = {
  icon: Users,
  title: "Usuarios",
  path: "/admin",
}

export function getNavItems(isSuperuser?: boolean): NavItem[] {
  return isSuperuser ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS
}
