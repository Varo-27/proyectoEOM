import type { AppNode } from "@/entities/graph/model/types"

import { GRAPH_SEARCH_RADIAL } from "@/entities/graph/model/constants"
import { DEFAULT_INPUT_NODE_ID } from "./graphNodeIds"
import { GRAPH_NODE_TYPE } from "./graphNodeTypes"

export function createDefaultQueryNode(): AppNode {
  const { centerOffsetX, centerOffsetY } = GRAPH_SEARCH_RADIAL

  return {
    id: DEFAULT_INPUT_NODE_ID,
    type: GRAPH_NODE_TYPE.query,
    position: {
      x: window.innerWidth / 2 - centerOffsetX,
      y: window.innerHeight / 2 - centerOffsetY,
    },
    data: {
      title: "Nueva búsqueda",
      query: "",
      appearDelay: 0,
    },
  }
}

/** @deprecated Usar `createDefaultQueryNode`. */
export function createDefaultInputNode(): AppNode {
  return createDefaultQueryNode()
}

export function createQueryNodeAtOffset(
  offsetIndex: number,
  nodeId?: string,
): AppNode {
  const base = createDefaultQueryNode()
  const horizontalShift = offsetIndex * 320

  return {
    ...base,
    id: nodeId ?? base.id,
    position: {
      x: base.position.x + horizontalShift,
      y: base.position.y + 120,
    },
    data: {
      ...base.data,
      title: "Nueva búsqueda",
      query: "",
    },
  }
}

/** @deprecated Usar `createQueryNodeAtOffset`. */
export function createInputNodeAtOffset(
  offsetIndex: number,
  nodeId?: string,
): AppNode {
  return createQueryNodeAtOffset(offsetIndex, nodeId)
}
