import type { AppNode } from "@/store/useGraphStore"

import { GRAPH_SEARCH_RADIAL } from "./graphConstants"
import { DEFAULT_INPUT_NODE_ID } from "./graphNodeIds"
import { GRAPH_NODE_TYPE } from "./graphNodeTypes"

export function createDefaultInputNode(): AppNode {
  const { centerOffsetX, centerOffsetY } = GRAPH_SEARCH_RADIAL

  return {
    id: DEFAULT_INPUT_NODE_ID,
    type: GRAPH_NODE_TYPE.input,
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

export function createInputNodeAtOffset(
  offsetIndex: number,
  nodeId?: string,
): AppNode {
  const base = createDefaultInputNode()
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
