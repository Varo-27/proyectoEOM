import type { AppNode } from "@/entities/graph/model/types"
import type { WorkspaceGraphSnapshot } from "@/entities/workspace"

import { createDefaultQueryNode } from "@/entities/graph/model/createDefaultInputNode"
import { createInputNodeId } from "@/entities/graph/model/graphNodeIds"
import { GRAPH_NODE_TYPE } from "@/entities/graph/model/graphNodeTypes"

/**
 * Normaliza snapshots antiguos:
 * - searchCenter → query
 * - input → query
 */
export function migrateGraphSnapshot(
  snapshot: WorkspaceGraphSnapshot,
): WorkspaceGraphSnapshot {
  const nodeIdMap = new Map<string, string>()
  const nodes = snapshot.nodes.map((node) => {
    if (node.type === GRAPH_NODE_TYPE.searchCenter) {
      const newId = createInputNodeId()
      nodeIdMap.set(node.id, newId)

      const title = node.data.title ?? ""
      const prefix = "Búsqueda: "
      const query = title.startsWith(prefix) ? title.slice(prefix.length) : title

      return {
        ...node,
        id: newId,
        type: GRAPH_NODE_TYPE.query,
        data: {
          ...node.data,
          query,
          title: query ? `Búsqueda: ${query}` : "Nueva búsqueda",
        },
      }
    }

    if (node.type === GRAPH_NODE_TYPE.input) {
      return {
        ...node,
        type: GRAPH_NODE_TYPE.query,
      }
    }

    return node
  })

  const edges =
    nodeIdMap.size === 0
      ? snapshot.edges
      : snapshot.edges.map((edge) => ({
          ...edge,
          id: remapEdgeId(edge.id, nodeIdMap),
          source: nodeIdMap.get(String(edge.source)) ?? String(edge.source),
          target: nodeIdMap.get(String(edge.target)) ?? String(edge.target),
        }))

  return {
    ...snapshot,
    nodes: stripTransientLayoutProps(stripAppearDelay(ensureDefaultQuery(nodes))),
    edges,
  }
}

const TRANSIENT_LAYOUT_KEYS = [
  "layoutLayer",
  "layoutComponentIndex",
  "layoutOrder",
] as const

/** Elimina props de layout transientes; conserva `searched`. */
function stripTransientLayoutProps(nodes: AppNode[]): AppNode[] {
  return nodes.map((node) => {
    const hasTransient = TRANSIENT_LAYOUT_KEYS.some(
      (key) => node.data[key] != null,
    )
    if (!hasTransient) {
      return node
    }

    const nextData = { ...node.data }
    for (const key of TRANSIENT_LAYOUT_KEYS) {
      delete nextData[key]
    }
    return { ...node, data: nextData }
  })
}

/** Evita re-animar artículos al rehidratar el workspace. */
function stripAppearDelay(nodes: AppNode[]): AppNode[] {
  return nodes.map((node) => {
    if (node.data.appearDelay == null) {
      return node
    }

    const { appearDelay: _removed, ...data } = node.data
    return { ...node, data }
  })
}

function remapEdgeId(edgeId: string, nodeIdMap: Map<string, string>): string {
  let nextId = edgeId
  for (const [oldId, newId] of nodeIdMap) {
    nextId = nextId.split(oldId).join(newId)
  }
  return nextId
}

function ensureDefaultQuery(nodes: AppNode[]): AppNode[] {
  const hasQuery = nodes.some(
    (node) =>
      node.type === GRAPH_NODE_TYPE.query ||
      node.type === GRAPH_NODE_TYPE.input,
  )
  if (hasQuery) {
    return nodes
  }

  return [createDefaultQueryNode(), ...nodes]
}
