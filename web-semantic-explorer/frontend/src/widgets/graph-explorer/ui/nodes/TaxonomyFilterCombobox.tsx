import { Check, Loader2 } from "lucide-react"
import { memo, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/shared/lib/utils"
import { Input } from "@/shared/ui/input"

type TaxonomyFilterComboboxProps = {
  value: string
  onCommit: (value: string) => void
  options: { name: string }[]
  isLoading?: boolean
  placeholder?: string
  loadingLabel?: string
  disabled?: boolean
}

function TaxonomyFilterComboboxComponent({
  value,
  onCommit,
  options,
  isLoading = false,
  placeholder = "Buscar…",
  loadingLabel = "Cargando…",
  disabled = false,
}: TaxonomyFilterComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return options.slice(0, 40)
    }

    return options
      .filter((option) => option.name.toLowerCase().includes(needle))
      .slice(0, 40)
  }, [options, query])

  const pickOption = (name: string) => {
    setQuery(name)
    onCommit(name)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={(event) => {
          if (disabled) {
            return
          }
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (!disabled) {
            setOpen(true)
          }
        }}
        placeholder={placeholder}
        className="graph-node__filter-input nodrag nopan"
        disabled={disabled}
        readOnly={disabled}
        onMouseDown={(event) => event.stopPropagation()}
        autoComplete="off"
      />

      {open && !disabled && (
        <ul
          className="graph-node__author-menu nodrag nopan"
          onMouseDown={(event) => event.stopPropagation()}
        >
          {isLoading && (
            <li className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {loadingLabel}
            </li>
          )}

          {!isLoading && filteredOptions.length === 0 && (
            <li className="px-2 py-2 text-xs text-muted-foreground">
              Sin coincidencias
            </li>
          )}

          {filteredOptions.map((option) => {
            const selected = option.name === value
            return (
              <li key={option.name}>
                <button
                  type="button"
                  className={cn(
                    "graph-node__author-option",
                    selected && "graph-node__author-option--selected",
                  )}
                  onClick={() => pickOption(option.name)}
                >
                  <Check
                    className={cn(
                      "h-3 w-3 shrink-0 text-primary",
                      !selected && "opacity-0",
                    )}
                  />
                  <span className="truncate">{option.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export const TaxonomyFilterCombobox = memo(TaxonomyFilterComboboxComponent)
