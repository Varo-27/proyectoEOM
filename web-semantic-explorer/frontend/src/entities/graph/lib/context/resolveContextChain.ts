import type { Edge } from "@xyflow/react"

import type { ArticleMetadataFilters } from "@/shared/lib/filters"
import type { AppNode } from "@/entities/graph/model/types"

import {
  FILTER_NODE_DIMENSIONS,
  isFilterNodeType,
  isInputNodeType,
} from "@/entities/graph/model/graphNodeTypes"

export type ResolvedContextChain = {
  /** Textos de nodos input encontrados al subir por el grafo. */
  seedQueries: string[]
  /** Ids de artículos en la cadena de ancestros (sin incluir el nodo origen). */
  contextArticleIds: number[]
  /** Filtros acumulados de nodos filter en el camino (AND). */
  upstreamFilters: ArticleMetadataFilters
  /** Id del nodo input raíz de la isla, si existe. */
  rootInputNodeId: string | null
}

type WalkState = {
  seedQueries: string[]
  contextArticleIds: number[]
  upstreamFilters: ArticleMetadataFilters
  rootInputNodeId: string | null
  visitedNodeIds: Set<string>
}

/**
 * Sube por las aristas (target → sources) desde un nodo hasta el input raíz
 * y acumula filtros y semillas de la tubería upstream.
 */
export function resolveContextChain(
  startNodeId: string,
  nodes: AppNode[],
  edges: Edge[],
): ResolvedContextChain {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const parentsByTarget = buildParentsByTarget(edges)

  const state: WalkState = {
    seedQueries: [],
    contextArticleIds: [],
    upstreamFilters: {},
    rootInputNodeId: null,
    visitedNodeIds: new Set(),
  }

  walkUpstream(startNodeId, nodeById, parentsByTarget, state)

  return {
    seedQueries: state.seedQueries,
    contextArticleIds: state.contextArticleIds,
    upstreamFilters: state.upstreamFilters,
    rootInputNodeId: state.rootInputNodeId,
  }
}

function buildParentsByTarget(edges: Edge[]): Map<string, string[]> {
  const parentsByTarget = new Map<string, string[]>()

  for (const edge of edges) {
    const target = String(edge.target)
    const source = String(edge.source)
    const current = parentsByTarget.get(target) ?? []
    parentsByTarget.set(target, [...current, source])
  }

  return parentsByTarget
}

function walkUpstream(
  nodeId: string,
  nodeById: Map<string, AppNode>,
  parentsByTarget: Map<string, string[]>,
  state: WalkState,
): void {
  if (state.visitedNodeIds.has(nodeId)) {
    return
  }

  state.visitedNodeIds.add(nodeId)

  const node = nodeById.get(nodeId)
  if (!node) {
    return
  }

  if (isInputNodeType(node.type)) {
    state.rootInputNodeId = node.id
    const query = readInputQuery(node)
    if (query) {
      state.seedQueries.push(query)
    }
  }

  if (isFilterNodeType(node.type)) {
    applyFilterNodeToAccumulated(node, state.upstreamFilters)
  }

  const articleId = Number(node.id)
  if (node.type === "article" && Number.isFinite(articleId)) {
    state.contextArticleIds.push(articleId)
  }

  const parentIds = parentsByTarget.get(nodeId) ?? []
  for (const parentId of parentIds) {
    walkUpstream(parentId, nodeById, parentsByTarget, state)
  }
}

function readInputQuery(node: AppNode): string {
  const fromData =
    typeof node.data.query === "string" ? node.data.query.trim() : ""
  if (fromData) {
    return fromData
  }

  const title = node.data.title ?? ""
  const prefix = "Búsqueda: "
  if (title.startsWith(prefix)) {
    return title.slice(prefix.length).trim()
  }

  return title.trim()
}

function applyFilterNodeToAccumulated(
  node: AppNode,
  accumulated: ArticleMetadataFilters,
): void {
  const filterKey = node.data.filterKey
  if (typeof filterKey !== "string" || !(filterKey in FILTER_NODE_DIMENSIONS)) {
    return
  }

  const key = filterKey as keyof ArticleMetadataFilters
  const rawValue = node.data.filterValue

  if (key === "year_start" || key === "year_end") {
    const parsed =
      typeof rawValue === "number"
        ? rawValue
        : Number.parseInt(String(rawValue ?? ""), 10)
    if (Number.isFinite(parsed)) {
      accumulated[key] = parsed
    }
    return
  }

  const textValue = String(rawValue ?? "").trim()
  if (textValue) {
    accumulated[key] = textValue
  }
}

/** Combina filtros globales del store con los de la cadena upstream (AND). */
export function mergeContextFilters(
  globalFilters: ArticleMetadataFilters,
  upstreamFilters: ArticleMetadataFilters,
): ArticleMetadataFilters {
  return { ...globalFilters, ...upstreamFilters }
}
