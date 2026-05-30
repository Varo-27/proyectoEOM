import type { Edge } from "@xyflow/react"

import type { ArticleMetadataFilters } from "@/lib/filters"
import type { AppNode } from "@/store/useGraphStore"

import { isFilterNodeType } from "../graphNodeTypes"
import { collectDownstreamNodeIds } from "./collectDownstreamNodeIds"

/**
 * Filtros conectados downstream del input (input → filtro → …)
 * antes de lanzar una búsqueda desde ese input.
 */
export function collectFiltersFromInputPipeline(
  inputNodeId: string,
  nodes: AppNode[],
  edges: Edge[],
): ArticleMetadataFilters {
  const downstreamIds = collectDownstreamNodeIds(inputNodeId, edges)
  const accumulated: ArticleMetadataFilters = {}

  for (const nodeId of downstreamIds) {
    const node = nodes.find((candidate) => candidate.id === nodeId)
    if (!node || !isFilterNodeType(node.type)) {
      continue
    }

    applyFilterNodeValue(node, accumulated)
  }

  return accumulated
}

function applyFilterNodeValue(
  node: AppNode,
  accumulated: ArticleMetadataFilters,
): void {
  const filterKey = node.data.filterKey
  if (typeof filterKey !== "string") {
    return
  }

  const rawValue = node.data.filterValue

  if (filterKey === "year_start" || filterKey === "year_end") {
    const parsed =
      typeof rawValue === "number"
        ? rawValue
        : Number.parseInt(String(rawValue ?? ""), 10)
    if (Number.isFinite(parsed)) {
      accumulated[filterKey] = parsed
    }
    return
  }

  if (
    filterKey !== "place" &&
    filterKey !== "category" &&
    filterKey !== "author"
  ) {
    return
  }

  const text = String(rawValue ?? "").trim()
  if (text) {
    accumulated[filterKey] = text
  }
}
