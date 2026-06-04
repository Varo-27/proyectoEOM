import { Filter, TextCursorInput } from "lucide-react"

import { cn } from "@/shared/lib/utils"

import { FILTER_NODE_DIMENSIONS, type FilterNodeKind } from "@/entities/graph"
import { setPaletteDragData } from "./paletteDrag"

type GraphNodePaletteProps = {
  isLoading?: boolean
}

const paletteItemClass =
  "graph-palette__draggable flex items-center gap-2 rounded-none border-2 border-foreground font-mono text-xs uppercase tracking-wider shadow-[2px_2px_0_0_var(--color-foreground)] transition-opacity disabled:pointer-events-none disabled:opacity-50"

export function GraphNodePalette({ isLoading }: GraphNodePaletteProps) {
  const disabled = isLoading === true

  return (
    <div className="graph-palette">
      <div>
        <h2 className="eom-heading-section">Añadir nodos</h2>
        <p className="graph-palette__hint">
          Arrastra un nodo al lienzo y suéltalo donde quieras. Conecta filtros
          entre la consulta y los artículos.
        </p>
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        draggable={!disabled}
        aria-label="Arrastrar nodo consulta al lienzo"
        className={cn(
          paletteItemClass,
          "h-10 justify-start bg-background px-3",
        )}
        onDragStart={(event) => {
          setPaletteDragData(event, { type: "query" })
        }}
      >
        <TextCursorInput className="h-4 w-4 shrink-0 text-primary" />
        Nodo consulta
      </div>

      <div className="flex flex-col gap-2">
        <span className="eom-label">Nodos filtro</span>
        {(
          Object.entries(FILTER_NODE_DIMENSIONS) as [FilterNodeKind, string][]
        ).map(([key, label]) => (
          <div
            key={key}
            role="button"
            tabIndex={disabled ? -1 : 0}
            draggable={!disabled}
            aria-label={`Arrastrar filtro ${label} al lienzo`}
            className={cn(
              paletteItemClass,
              "h-9 justify-start border border-foreground/25 bg-transparent px-2 text-[10px] hover:border-foreground",
            )}
            onDragStart={(event) => {
              setPaletteDragData(event, { type: "filter", filterKey: key })
            }}
          >
            <Filter className="h-3.5 w-3.5 shrink-0 text-primary" />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
