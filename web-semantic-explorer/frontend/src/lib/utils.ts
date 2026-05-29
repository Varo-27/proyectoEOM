import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/** Combina clases Tailwind con resolución de conflictos (shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { getInitials } from "./string"
