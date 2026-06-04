import { Star } from "lucide-react"

import { cn } from "@/shared/lib/utils"

type StarRatingProps = {
  value: number
  max?: number
  size?: "sm" | "md"
}

export function StarRating({ value, max = 5, size = "md" }: StarRatingProps) {
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"

  return (
    <div
      role="img"
      className="flex items-center gap-0.5"
      aria-label={`Valoración ${value} de ${max}`}
    >
      {Array.from({ length: max }, (_, index) => {
        const filled = index < Math.round(value)
        return (
          <Star
            key={index}
            className={cn(
              iconClass,
              filled
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        )
      })}
    </div>
  )
}
