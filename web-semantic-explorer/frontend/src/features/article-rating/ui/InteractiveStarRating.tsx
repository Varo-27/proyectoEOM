import { useCallback, useState } from "react"

import { cn } from "@/shared/lib/utils"

import { getStarFill, normalizeRatingValue, ratingFromPointerRatio } from "../lib/starFill"
import { StarIcon } from "./StarIcon"

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
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const displayValue = hoverValue ?? value ?? 0

  const updateHoverFromEvent = useCallback(
    (clientX: number, currentTarget: HTMLElement) => {
      const rect = currentTarget.getBoundingClientRect()
      const ratio = (clientX - rect.left) / rect.width
      setHoverValue(ratingFromPointerRatio(ratio, max))
    },
    [max],
  )

  const handlePointerClick = useCallback(
    (clientX: number, currentTarget: HTMLElement) => {
      if (disabled) return
      const rect = currentTarget.getBoundingClientRect()
      const ratio = (clientX - rect.left) / rect.width
      const next = ratingFromPointerRatio(ratio, max)
      onChange(normalizeRatingValue(next))
    },
    [disabled, max, onChange],
  )

  return (
    <fieldset
      className={cn(
        "flex min-w-0 max-w-[10.5rem] cursor-pointer items-center border-0 p-0",
        disabled && "cursor-not-allowed opacity-50",
      )}
      tabIndex={disabled ? -1 : 0}
      onMouseMove={(event) => {
        if (disabled) return
        updateHoverFromEvent(event.clientX, event.currentTarget)
      }}
      onMouseLeave={() => setHoverValue(null)}
      onClick={(event) => {
        handlePointerClick(event.clientX, event.currentTarget)
      }}
      onKeyDown={(event) => {
        if (disabled) return
        const current = value ?? 0.5
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault()
          onChange(Math.min(max, Math.round((current + 0.5) * 2) / 2))
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault()
          onChange(Math.max(0.5, Math.round((current - 0.5) * 2) / 2))
        }
      }}
    >
      <legend className="sr-only">Tu valoración</legend>
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className="flex flex-1 justify-center p-0.5"
          aria-hidden
        >
          <StarIcon fill={getStarFill(index, displayValue)} size="lg" />
        </span>
      ))}
      <span className="sr-only" aria-live="polite">
        {displayValue > 0
          ? `${displayValue.toFixed(1)} de ${max} estrellas`
          : "Sin valoración"}
      </span>
    </fieldset>
  )
}
