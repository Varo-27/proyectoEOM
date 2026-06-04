import type { XYPosition } from "@xyflow/react"

import type { AppNode } from "./types"
import { createFilterNodeId, createInputNodeId } from "./graphNodeIds"
import {
  FILTER_NODE_DIMENSIONS,
  type FilterNodeKind,
  GRAPH_NODE_TYPE,
} from "./graphNodeTypes"

export function createQueryNodeAtPosition(
  position: XYPosition,
  nodeId = createInputNodeId(),
): AppNode {
  return {
    id: nodeId,
    type: GRAPH_NODE_TYPE.query,
    position,
    data: {
      title: "Nueva búsqueda",
      query: "",
      appearDelay: 0,
    },
  }
}

/** @deprecated Usar `createQueryNodeAtPosition`. */
export function createInputNodeAtPosition(
  position: XYPosition,
  nodeId = createInputNodeId(),
): AppNode {
  return createQueryNodeAtPosition(position, nodeId)
}

export function createFilterNodeAtPosition(
  filterKey: FilterNodeKind,
  position: XYPosition,
  nodeId = createFilterNodeId(filterKey),
): AppNode {
  const label = FILTER_NODE_DIMENSIONS[filterKey]

  return {
    id: nodeId,
    type: GRAPH_NODE_TYPE.filter,
    position,
    data: {
      title: `${label}: …`,
      filterKey,
      filterValue: "",
      appearDelay: 0,
    },
  }
}
