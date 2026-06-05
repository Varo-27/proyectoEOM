import dagre from "@dagrejs/dagre"
import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

import { assignLayersLongestPath } from "./graphLayerAssignment"
import { GRAPH_LAYOUT_SUGIYAMA } from "./graphConstants"
import {
  filterSubgraph,
  findConnectedComponents,
} from "./graphTopology"

function layoutOrderWithinLayer(
  nodeIds: string[],
  positions: Map<string, { x: number; y: number }>,
): Map<string, number> {
  const order = new Map<string, number>()
  const sorted = [...nodeIds].sort(
    (left, right) =>
      (positions.get(left)?.x ?? 0) - (positions.get(right)?.x ?? 0),
  )

  sorted.forEach((nodeId, index) => {
    order.set(nodeId, index)
  })

  return order
}

/**
 * Layout jerárquico Sugiyama (dagre longest-path + composición multi-componente).
 */
export const applySugiyamaLayout = (nodes: AppNode[], edges: Edge[]) => {
  if (nodes.length === 0) {
    return nodes
  }

  const {
    nodeWidth,
    nodeHeight,
    horizontalGap,
    verticalGap,
    componentGap,
    offsetY,
  } = GRAPH_LAYOUT_SUGIYAMA

  const allNodeIds = nodes.map((node) => node.id)
  const layersByNode = assignLayersLongestPath(allNodeIds, edges)
  const components = findConnectedComponents(nodes, edges)

  const positionMap = new Map<string, { x: number; y: number }>()
  const componentIndexByNode = new Map<string, number>()
  const orderByNode = new Map<string, number>()

  let globalOffsetX = 0

  for (let componentIndex = 0; componentIndex < components.length; componentIndex++) {
    const componentNodeIds = components[componentIndex]
    const { nodes: componentNodes, edges: componentEdges } = filterSubgraph(
      nodes,
      edges,
      componentNodeIds,
    )

    for (const nodeId of componentNodeIds) {
      componentIndexByNode.set(nodeId, componentIndex)
    }

    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({
      rankdir: "TB",
      ranker: "longest-path",
      acyclicer: "greedy",
      nodesep: horizontalGap,
      ranksep: verticalGap,
    })

    for (const node of componentNodes) {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    }

    for (const edge of componentEdges) {
      dagreGraph.setEdge(String(edge.source), String(edge.target))
    }

    dagre.layout(dagreGraph)

    const localPositions = new Map<string, { x: number; y: number }>()

    for (const node of componentNodes) {
      const layoutNode = dagreGraph.node(node.id)
      localPositions.set(node.id, {
        x: layoutNode.x - nodeWidth / 2,
        y: layoutNode.y - nodeHeight / 2,
      })
    }

    const localOrder = layoutOrderWithinLayer(componentNodeIds, localPositions)
    for (const [nodeId, order] of localOrder) {
      orderByNode.set(nodeId, order)
    }

    const localXs = componentNodeIds.map(
      (nodeId) => localPositions.get(nodeId)?.x ?? 0,
    )
    const minLocalX = localXs.length > 0 ? Math.min(...localXs) : 0
    const maxLocalX = localXs.length > 0 ? Math.max(...localXs) : 0
    const componentWidth = maxLocalX - minLocalX + nodeWidth

    for (const nodeId of componentNodeIds) {
      const local = localPositions.get(nodeId)
      if (!local) {
        continue
      }

      const layer = layersByNode.get(nodeId) ?? 1
      positionMap.set(nodeId, {
        x: local.x - minLocalX + globalOffsetX,
        y: (layer - 1) * (nodeHeight + verticalGap) + offsetY,
      })
    }

    globalOffsetX += componentWidth + componentGap
  }

  const positionedX = [...positionMap.values()].map((position) => position.x)
  const centerOffsetX =
    positionedX.length > 0
      ? window.innerWidth / 2 -
        (Math.min(...positionedX) + Math.max(...positionedX) + nodeWidth) / 2
      : 0

  return nodes.map((node) => {
    const position = positionMap.get(node.id)
    if (!position) {
      return node
    }

    return {
      ...node,
      position: {
        x: position.x + centerOffsetX,
        y: position.y,
      },
      data: {
        ...node.data,
        layoutLayer: layersByNode.get(node.id),
        layoutComponentIndex: componentIndexByNode.get(node.id),
        layoutOrder: orderByNode.get(node.id),
      },
    }
  })
}
