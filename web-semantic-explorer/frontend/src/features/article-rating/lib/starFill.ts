export type StarFill = "empty" | "half" | "full"

export function getStarFill(starIndex: number, value: number): StarFill {
  const starNumber = starIndex + 1
  if (value >= starNumber) return "full"
  if (value >= starNumber - 0.5) return "half"
  return "empty"
}

export function normalizeRatingValue(value: number): number {
  return Math.round(value * 2) / 2
}

/** Convierte posición horizontal (0–1) en valor 0.5, 1, … max. */
export function ratingFromPointerRatio(ratio: number, max = 5): number {
  const clamped = Math.min(1, Math.max(0, ratio))
  const raw = clamped * max
  const stepped = Math.ceil(raw * 2) / 2
  if (stepped <= 0) return 0.5
  return Math.min(max, stepped)
}
