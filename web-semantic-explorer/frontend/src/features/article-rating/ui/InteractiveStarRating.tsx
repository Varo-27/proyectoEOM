import { Star } from "lucide-react"

import { cn } from "@/shared/lib/utils"

type InteractiveStarRatingProps = {
  value: number | null
  onChange: (value: number) => void
  disabled?: boolean
  max?: number
}

export function InteractiveStarRating({
  value,
  onChange,
  disabled = false,
  max = 5,
}: InteractiveStarRatingProps) {
  return (
    <fieldset className="flex min-w-0 items-center gap-0.5 border-0 p-0">
      <legend className="sr-only">Tu valoración</legend>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1
        const filled = value != null && starValue <= value
        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            aria-label={`Valorar con ${starValue} estrellas`}
            aria-pressed={value === starValue}
            onClick={() => onChange(starValue)}
            className={cn(
              "rounded-sm p-0.5 transition-colors",
              disabled && "cursor-not-allowed opacity-50",
              !disabled && "hover:scale-110",
            )}
          >
            <Star
              className={cn(
                "h-5 w-5",
                filled
                  ? "fill-primary text-primary"
                  : "fill-transparent text-muted-foreground/40",
              )}
            />
          </button>
        )
      })}
    </fieldset>
  )
}
