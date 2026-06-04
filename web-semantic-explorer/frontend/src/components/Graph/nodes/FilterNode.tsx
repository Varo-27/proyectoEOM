import { Handle, type NodeProps, Position } from "@xyflow/react"
import { Filter } from "lucide-react"
import { memo, useEffect, useState } from "react"

import { Input } from "@/shared/ui/input"
import { cn } from "@/shared/lib/utils"
import { type ArticleMetadataFilters, FILTER_LABELS } from "@/shared/lib/filters"
import type { AppNode } from "@/entities/graph"
import { useGraphStore } from "@/entities/graph"

import { FILTER_NODE_DIMENSIONS, type FilterNodeKind } from "@/entities/graph"
import { AuthorFilterCombobox } from "./AuthorFilterCombobox"
import { NodeDeleteButton } from "./NodeDeleteButton"

function updateNodeData(nodeId: string, patch: Partial<AppNode["data"]>) {
  const { nodes, setNodes } = useGraphStore.getState()
  setNodes(
    nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...patch } } : node,
    ),
  )
}

function FilterNodeComponent({ id, data }: NodeProps<AppNode>) {
  const activeNodeId = useGraphStore((state) => state.activeNodeId)
  const isActive = activeNodeId === id
  const filterKey = data.filterKey as FilterNodeKind | undefined
  const dimensionLabel =
    filterKey && filterKey in FILTER_NODE_DIMENSIONS
      ? FILTER_NODE_DIMENSIONS[filterKey]
      : "Filtro"

  const storedValue = String(data.filterValue ?? "")
  const [draftValue, setDraftValue] = useState(storedValue)

  useEffect(() => {
    setDraftValue(storedValue)
  }, [storedValue])

  const commitValue = (nextValue: string) => {
    updateNodeData(id, {
      filterValue: nextValue,
      title: `${dimensionLabel}: ${nextValue || "…"}`,
    })
  }

  useEffect(() => {
    if (filterKey === "author") {
      return
    }

    const timeout = window.setTimeout(() => {
      if (draftValue !== storedValue) {
        updateNodeData(id, {
          filterValue: draftValue,
          title: `${dimensionLabel}: ${draftValue || "…"}`,
        })
      }
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [draftValue, dimensionLabel, filterKey, id, storedValue])

  const isYearField = filterKey === "year_start" || filterKey === "year_end"

  return (
    <div
      className={cn("graph-node graph-node--filter", isActive && "graph-node-active")}
    >
      <Handle type="target" position={Position.Top} className="rf-handle" />
      <div className="graph-node__surface">
        <div className="graph-node__filter-header">
          <Filter className="h-4 w-4 shrink-0 text-primary" />
          <span className="eom-label min-w-0 flex-1">{dimensionLabel}</span>
          <NodeDeleteButton nodeId={id} ariaLabel="Eliminar filtro" />
        </div>
        {filterKey === "author" ? (
          <AuthorFilterCombobox
            value={storedValue}
            onCommit={commitValue}
            placeholder={String(FILTER_LABELS.author)}
          />
        ) : (
          <Input
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={() => commitValue(draftValue)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitValue(draftValue)
              }
            }}
            placeholder={
              filterKey && filterKey in FILTER_LABELS
                ? String(
                    FILTER_LABELS[filterKey as keyof ArticleMetadataFilters],
                  )
                : "Valor"
            }
            type={isYearField ? "number" : "text"}
            className="graph-node__filter-input nodrag nopan"
            onMouseDown={(event) => event.stopPropagation()}
          />
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="rf-handle" />
    </div>
  )
}

export const FilterNode = memo(FilterNodeComponent)
