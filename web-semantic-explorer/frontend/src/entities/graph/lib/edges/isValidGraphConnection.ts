import type { Connection, Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

import {
  GRAPH_NODE_TYPE,
  isArticleNodeType,
  isFilterNodeType,
  isQueryNodeType,
} from "@/entities/graph/model/graphNodeTypes"

function nodeTypeOf(
  nodeId: string | null | undefined,
  nodeById: Map<string, AppNode>,
): string | undefined {
  if (!nodeId) {
    return undefined
  }
  return nodeById.get(String(nodeId))?.type
}

/**
 * Valida conexiones del pipeline: query → filter → article.
 * Los artículos pueden encadenarse entre sí.
 */
export function isValidGraphConnection(
  connection: Connection | Edge,
  nodes: AppNode[],
): boolean {
  const source = String(connection.source)
  const target = String(connection.target)

  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const sourceType = nodeTypeOf(source, nodeById)
  const targetType = nodeTypeOf(target, nodeById)

  if (!sourceType || !targetType) {
    return false
  }

  if (source === target) {
    return false
  }

  if (isQueryNodeType(sourceType)) {
    return isFilterNodeType(targetType) || isArticleNodeType(targetType)
  }

  if (isFilterNodeType(sourceType)) {
    return isFilterNodeType(targetType) || isArticleNodeType(targetType)
  }

  if (isArticleNodeType(sourceType)) {
    return isArticleNodeType(targetType)
  }

  if (sourceType === GRAPH_NODE_TYPE.searchCenter) {
    return isFilterNodeType(targetType) || isArticleNodeType(targetType)
  }

  return false
}

export function getInvalidConnectionMessage(
  connection: Connection | Edge,
  nodes: AppNode[],
): string | null {
  if (isValidGraphConnection(connection, nodes)) {
    return null
  }

  return "Conexión no permitida: usa query → filtro → artículo"
}

export function createEdgeId(source: string, target: string): string {
  return `e-${source}-${target}`
}

export function buildEdge(source: string, target: string): Edge {
  return {
    id: createEdgeId(source, target),
    source,
    target,
  }
}
