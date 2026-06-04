import { Link } from "@tanstack/react-router"

import { useTheme } from "@/shared/lib/theme/ThemeProvider"
import { cn } from "@/shared/lib/utils"
import icon from "/assets/images/fastapi-icon.svg"
import iconLight from "/assets/images/fastapi-icon-light.svg"
import logo from "/assets/images/fastapi-logo.svg"
import logoLight from "/assets/images/fastapi-logo-light.svg"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
  alt?: string
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
  alt = "FastAPI",
}: LogoProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const fullLogo = isDark ? logoLight : logo
  const iconLogo = isDark ? iconLight : icon
  const imageAlt = asLink ? "" : alt

  const content =
    variant === "responsive" ? (
      <>
        <img
          src={fullLogo}
          alt={imageAlt}
          className={cn(
            "h-6 w-auto group-data-[collapsible=icon]:hidden",
            className,
          )}
        />
        <img
          src={iconLogo}
          alt=""
          aria-hidden="true"
          className={cn(
            "size-5 hidden group-data-[collapsible=icon]:block",
            className,
          )}
        />
      </>
    ) : (
      <img
        src={variant === "full" ? fullLogo : iconLogo}
        alt={imageAlt}
        className={cn(variant === "full" ? "h-6 w-auto" : "size-5", className)}
      />
    )

  if (!asLink) {
    return content
  }

  return (
    <Link to="/" aria-label={alt}>
      {content}
    </Link>
  )
}
