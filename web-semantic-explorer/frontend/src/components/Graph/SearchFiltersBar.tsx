import { useQuery } from "@tanstack/react-query"
import { Filter, Loader2, X } from "lucide-react"
import { useId } from "react"

import { listAuthors } from "@/api/taxonomy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FILTER_LABELS,
  type ArticleMetadataFilters,
  formatFilterValue,
  hasActiveFilters,
} from "@/lib/filters"

type SearchFiltersBarProps = {
  filters: ArticleMetadataFilters
  onChange: (filters: ArticleMetadataFilters) => void
  onClear: () => void
  onClearFilter?: (key: keyof ArticleMetadataFilters) => void
}

const fieldClass =
  "h-9 w-full rounded-none border-foreground/40 bg-background text-sm focus-visible:ring-1"

const labelClass =
  "font-mono text-[10px] uppercase tracking-widest text-muted-foreground"

export function SearchFiltersBar({
  filters,
  onChange,
  onClear,
  onClearFilter,
}: SearchFiltersBarProps) {
  const baseId = useId()
  const authorSelectId = `${baseId}-author`

  const { data: authorsData, isLoading: authorsLoading } = useQuery({
    queryKey: ["taxonomy", "authors"],
    queryFn: () => listAuthors(),
    staleTime: 1000 * 60 * 10,
  })

  const updateField = <K extends keyof ArticleMetadataFilters>(
    key: K,
    raw: string,
  ) => {
    if (key === "year_start" || key === "year_end") {
      const trimmed = raw.trim()
      if (!trimmed) {
        onChange({ ...filters, [key]: undefined })
        return
      }
      const parsed = Number.parseInt(trimmed, 10)
      onChange({
        ...filters,
        [key]: Number.isFinite(parsed) ? parsed : filters[key],
      })
      return
    }

    onChange({ ...filters, [key]: raw || undefined })
  }

  const activeFilterEntries = (
    Object.entries(filters) as [
      keyof ArticleMetadataFilters,
      string | number | undefined,
    ][]
  ).filter(([, value]) => value !== undefined && value !== "")

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t-2 border-foreground bg-map-panel p-4 lg:w-80 lg:max-w-[min(20rem,40vw)] lg:border-t-0 lg:border-l-2">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        Filtros · metadatos
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Restringen búsqueda y expansión del grafo. El autor es coincidencia
        exacta (desplegable). Se sincronizan con la URL.
      </p>

      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor={`${baseId}-place`} className={labelClass}>
            Lugar
          </label>
          <Input
            id={`${baseId}-place`}
            value={filters.place ?? ""}
            onChange={(e) => updateField("place", e.target.value)}
            placeholder="País, ciudad…"
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor={`${baseId}-category`} className={labelClass}>
            Categoría
          </label>
          <Input
            id={`${baseId}-category`}
            value={filters.category ?? ""}
            onChange={(e) => updateField("category", e.target.value)}
            placeholder="Tema editorial…"
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor={authorSelectId} className={labelClass}>
            Autor
          </label>
          <Select
            value={filters.author ?? "__all__"}
            onValueChange={(value) =>
              updateField("author", value === "__all__" ? "" : value)
            }
          >
            <SelectTrigger
              id={authorSelectId}
              className={`${fieldClass} w-full rounded-none border-2 border-foreground/40 shadow-none`}
            >
              <SelectValue placeholder="Todos los autores" />
            </SelectTrigger>
            <SelectContent className="max-h-60 rounded-none border-2 border-foreground">
              <SelectItem value="__all__">Todos los autores</SelectItem>
              {authorsLoading && (
                <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Cargando…
                </div>
              )}
              {authorsData?.authors.map((author) => (
                <SelectItem key={author.name} value={author.name}>
                  {author.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label htmlFor={`${baseId}-year-start`} className={labelClass}>
              Desde
            </label>
            <Input
              id={`${baseId}-year-start`}
              type="number"
              inputMode="numeric"
              value={filters.year_start ?? ""}
              onChange={(e) => updateField("year_start", e.target.value)}
              placeholder="Año"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor={`${baseId}-year-end`} className={labelClass}>
              Hasta
            </label>
            <Input
              id={`${baseId}-year-end`}
              type="number"
              inputMode="numeric"
              value={filters.year_end ?? ""}
              onChange={(e) => updateField("year_end", e.target.value)}
              placeholder="Año"
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      {hasActiveFilters(filters) && (
        <div className="space-y-2 border-t border-foreground/20 pt-3">
          <p className={labelClass}>Activos</p>
          <div className="flex flex-wrap gap-1.5">
            {activeFilterEntries.map(([key, value]) => (
              <Badge
                key={key}
                variant="outline"
                className="gap-1.5 rounded-none border-foreground px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
              >
                {FILTER_LABELS[key]}: {formatFilterValue(key, value!)}
                {onClearFilter && (
                  <button
                    type="button"
                    onClick={() => onClearFilter(key)}
                    className="inline-flex items-center hover:text-foreground"
                    aria-label={`Quitar filtro ${FILTER_LABELS[key]}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onClear}
        disabled={!hasActiveFilters(filters)}
        className="h-9 w-full rounded-none border-2 border-foreground font-mono text-[10px] uppercase tracking-widest shadow-[2px_2px_0_0_var(--color-foreground)]"
      >
        <X className="mr-1 h-3 w-3" />
        Limpiar filtros
      </Button>
    </aside>
  )
}
