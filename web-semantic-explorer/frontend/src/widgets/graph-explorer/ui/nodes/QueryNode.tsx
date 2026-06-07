import { Handle, type NodeProps, Position } from "@xyflow/react"
import { Search } from "lucide-react"
import { memo, useEffect, useState } from "react"
import type { AppNode } from "@/entities/graph"
import { useGraphStore } from "@/entities/graph"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"

import { NodeDeleteButton } from "./NodeDeleteButton"
import { QueryNodeFilterRows } from "./QueryNodeFilterRows"

function QueryNodeComponent({ id, data }: NodeProps<AppNode>) {
  const isLoading = useGraphStore((state) => state.isLoading)
  const activeNodeId = useGraphStore((state) => state.activeNodeId)
  const isActive = activeNodeId === id
  const isSearched = data.searched === true

  const initialQuery =
    typeof data.query === "string" ? data.query : readQueryFromTitle(data.title)

  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (isSearched) {
      return
    }
    const trimmed = query.trim()
    const searchFromQuery = useGraphStore.getState().searchFromInput
    if (!trimmed || !searchFromQuery) {
      return
    }
    searchFromQuery(id, trimmed)
  }

  return (
    <div
      className={cn(
        "graph-node graph-node--query",
        isActive && "graph-node-active",
      )}
    >
      <Handle type="target" position={Position.Top} className="rf-handle" />
      <div className="graph-node__surface">
        <div className="graph-node__header-row">
          <div className="flex items-center gap-3">
            <div className="graph-node__icon-badge">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="eom-label-primary">Consulta semántica</span>
              <span className="eom-lead-serif">
                {isSearched ? data.title : "Escribe y pulsa Explorar"}
              </span>
            </div>
          </div>
          <NodeDeleteButton nodeId={id} ariaLabel="Eliminar búsqueda" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Temática, autor, lugar..."
            className="graph-node__input nodrag nopan"
            disabled={isSearched}
            readOnly={isSearched}
            onMouseDown={(event) => event.stopPropagation()}
          />
          <Button
            type="submit"
            disabled={isLoading || !query.trim() || isSearched}
            className="graph-node__submit nodrag nopan"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {isLoading ? "Buscando..." : "Explorar"}
          </Button>
        </form>

        <QueryNodeFilterRows nodeId={id} data={data} disabled={isSearched} />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="rf-handle rf-handle--primary"
      />
    </div>
  )
}

export const QueryNode = memo(QueryNodeComponent)

function readQueryFromTitle(title: string): string {
  const prefix = "Búsqueda: "
  if (title.startsWith(prefix)) {
    return title.slice(prefix.length)
  }
  return ""
}
