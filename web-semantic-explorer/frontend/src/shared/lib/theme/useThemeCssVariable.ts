import { useEffect, useState } from "react"
import { readCssVariable } from "./readCssVariable"
import { useTheme } from "./ThemeProvider"

/** Reacciona a cambios de tema claro/oscuro y data-theme. */
export function useThemeCssVariable(name: string, fallback: string): string {
  const { resolvedTheme, colorTheme } = useTheme()
  const [value, setValue] = useState(fallback)

  useEffect(() => {
    setValue(readCssVariable(name) || fallback)
  }, [name, fallback, resolvedTheme, colorTheme])

  return value
}
