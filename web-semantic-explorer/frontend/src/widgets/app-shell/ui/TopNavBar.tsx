import { Link as RouterLink, useRouterState } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import { LogIn, LogOut, Monitor, Moon, Settings, Sun, User, UserPlus } from "lucide-react"

import { Logo } from "@/shared/ui/logo/Logo"
import { getNavItems, type NavItem } from "../config/navConfig"
import { type Theme, useTheme } from "@/shared/lib/theme/ThemeProvider"
import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import useAuth from "@/features/auth"
import { cn } from "@/shared/lib/utils"
import { getInitials } from "@/shared/lib/string"

const THEME_ICONS: Record<Theme, LucideIcon> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

function NavLink({ item }: { item: NavItem }) {
  const router = useRouterState()
  const isActive = router.location.pathname === item.path
  const Icon = item.icon

  return (
    <RouterLink
      to={item.path}
      className={cn(
        "eom-nav-link",
        isActive ? "eom-nav-link--active" : "eom-nav-link--idle",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span>{item.title}</span>
    </RouterLink>
  )
}

function NavAppearance() {
  const { setTheme, theme } = useTheme()
  const Icon = THEME_ICONS[theme]

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        data-testid="theme-button"
        className="eom-nav-icon-btn"
      >
        <Icon className="size-4" aria-hidden />
        <span className="sr-only">Apariencia</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="eom-dropdown-brutal">
        <DropdownMenuItem
          data-testid="light-mode"
          className="eom-dropdown-item"
          onClick={() => setTheme("light")}
        >
          <Sun className="size-4" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem
          data-testid="dark-mode"
          className="eom-dropdown-item"
          onClick={() => setTheme("dark")}
        >
          <Moon className="size-4" />
          Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem
          className="eom-dropdown-item"
          onClick={() => setTheme("system")}
        >
          <Monitor className="size-4" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavGuestAccount() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="guest-menu"
        className="eom-nav-user-trigger"
      >
        <span className="flex size-7 items-center justify-center rounded-none border border-foreground/30 bg-muted">
          <User className="size-4" aria-hidden />
        </span>
        <span className="hidden truncate text-[10px] font-mono uppercase tracking-widest sm:inline">
          Invitado
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="eom-dropdown-brutal min-w-56">
        <DropdownMenuLabel className="rounded-none font-normal">
          <p className="text-sm font-medium">Modo invitado</p>
          <p className="text-xs text-muted-foreground">
            Explora sin cuenta. Sin favoritos ni comentarios.
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-none">
          <RouterLink
            to="/login"
            className="text-xs uppercase tracking-widest"
          >
            <LogIn className="size-4" />
            Iniciar sesión
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-none">
          <RouterLink
            to="/signup"
            className="text-xs uppercase tracking-widest"
          >
            <UserPlus className="size-4" />
            Crear cuenta
          </RouterLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavUser() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="user-menu"
        className="eom-nav-user-trigger"
      >
        <Avatar className="size-7 rounded-none border border-foreground/30">
          <AvatarFallback className="rounded-none bg-muted text-[10px] font-mono uppercase">
            {getInitials(user.full_name || "User")}
          </AvatarFallback>
        </Avatar>
        <span className="hidden truncate text-[10px] font-mono uppercase tracking-widest sm:inline">
          {user.full_name?.split(" ")[0] ?? "Cuenta"}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="eom-dropdown-brutal min-w-56">
        <DropdownMenuLabel className="rounded-none font-normal">
          <p className="truncate text-sm font-medium">{user.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-none">
          <RouterLink
            to="/settings"
            className="text-xs uppercase tracking-widest"
          >
            <Settings className="size-4" />
            Ajustes
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-none text-xs uppercase tracking-widest"
          onClick={() => logout()}
        >
          <LogOut className="size-4" />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TopNavBar() {
  const { user } = useAuth()
  const items = getNavItems(user?.is_superuser)

  return (
    <header className="eom-nav-header">
      <Logo variant="full" className="h-5 w-auto shrink-0" />
      <nav className="eom-nav-menu" aria-label="Principal">
        {items.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
      </nav>
      <div className="eom-nav-cluster">
        <NavAppearance />
        {user ? <NavUser /> : <NavGuestAccount />}
      </div>
    </header>
  )
}
