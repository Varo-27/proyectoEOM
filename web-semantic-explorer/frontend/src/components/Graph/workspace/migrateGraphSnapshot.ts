import type { AppNode } from "@/store/graph/types"
import type { WorkspaceGraphSnapshot } from "@/store/workspace/types"

import { createDefaultInputNode } from "../createDefaultInputNode"
import { createInputNodeId } from "../graphNodeIds"
import { GRAPH_NODE_TYPE } from "../graphNodeTypes"

/**
 * Normaliza snapshots antiguos (searchCenter / semilla) a nodos input.
 */
export function migrateGraphSnapshot(
  snapshot: WorkspaceGraphSnapshot,
): WorkspaceGraphSnapshot {
  const nodeIdMap = new Map<string, string>()
  const nodes = snapshot.nodes.map((node) => {
    if (node.type !== GRAPH_NODE_TYPE.searchCenter) {
      return node
    }

    const newId = createInputNodeId()
    nodeIdMap.set(node.id, newId)

    const title = node.data.title ?? ""
    const prefix = "Búsqueda: "
    const query = title.startsWith(prefix) ? title.slice(prefix.length) : title

    return {
      ...node,
      id: newId,
      type: GRAPH_NODE_TYPE.input,
      data: {
        ...node.data,
        query,
        title: query ? `Búsqueda: ${query}` : "Nueva búsqueda",
      },
    }
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
    nodes: stripAppearDelay(ensureDefaultInput(nodes)),
    edges,
  }
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

function ensureDefaultInput(nodes: AppNode[]): AppNode[] {
  const hasInput = nodes.some((node) => node.type === GRAPH_NODE_TYPE.input)
  if (hasInput) {
    return nodes
  }

  return [createDefaultInputNode(), ...nodes]
}
