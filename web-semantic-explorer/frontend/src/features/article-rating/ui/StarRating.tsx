import { getStarFill } from "../lib/starFill"
import { StarIcon } from "./StarIcon"

type StarRatingProps = {
  value: number
  max?: number
  size?: "sm" | "md"
}

export function StarRating({ value, max = 5, size = "md" }: StarRatingProps) {
  const iconSize = size === "sm" ? "sm" : "md"

  return (
    <div
      role="img"
      className="flex items-center gap-0.5"
      aria-label={`Valoración ${value.toFixed(1)} de ${max}`}
    >
      {Array.from({ length: max }, (_, index) => (
        <StarIcon
          key={index}
          fill={getStarFill(index, value)}
          size={iconSize}
        />
      ))}
    </div>
  )
}
