import { Star } from "lucide-react"

import { cn } from "@/shared/lib/utils"

import type { StarFill } from "../lib/starFill"

type StarIconProps = {
  fill: StarFill
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZE_CLASS = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const

export function StarIcon({ fill, size = "md", className }: StarIconProps) {
  const iconClass = SIZE_CLASS[size]

  return (
    <span className={cn("relative inline-flex shrink-0", iconClass, className)}>
      <Star
        className={cn(iconClass, "fill-transparent text-muted-foreground/40")}
        aria-hidden
      />
      {fill !== "empty" && (
        <Star
          className={cn(
            iconClass,
            "absolute inset-0 fill-primary text-primary",
          )}
          style={
            fill === "half"
              ? { clipPath: "inset(0 50% 0 0)" }
              : undefined
          }
          aria-hidden
        />
      )}
    </span>
  )
}
