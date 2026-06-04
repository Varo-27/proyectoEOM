import type { Edge } from "@xyflow/react"

import type { ArticleMetadataFilters } from "@/lib/filters"
import type { AppNode } from "@/entities/graph/model/types"

import { collectFiltersFromInputPipeline } from "@/entities/graph/lib/subgraph/collectFiltersFromInputPipeline"
import {
  mergeContextFilters,
  type ResolvedContextChain,
  resolveContextChain,
} from "./resolveContextChain"

export type ResolvedSearchContext = {
  filters: ArticleMetadataFilters
  seedQueries: string[]
  contextArticleIds: number[]
}

/**
 * Contexto al buscar desde un nodo input: filtros downstream + upstream
 * y artículos ancestros para enriquecer el ranking semántico.
 */
export function resolveSearchContext(
  inputNodeId: string,
  nodes: AppNode[],
  edges: Edge[],
): ResolvedSearchContext {
  const downstreamFilters = collectFiltersFromInputPipeline(
    inputNodeId,
    nodes,
    edges,
  )
  const chain: ResolvedContextChain = resolveContextChain(
    inputNodeId,
    nodes,
    edges,
  )

  return {
    filters: mergeContextFilters(downstreamFilters, chain.upstreamFilters),
    seedQueries: chain.seedQueries,
    contextArticleIds: chain.contextArticleIds,
  }
}
