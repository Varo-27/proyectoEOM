import type { Edge } from "@xyflow/react"
import { type HierarchyPointNode, hierarchy, tree } from "d3-hierarchy"

import type { AppNode } from "@/store/useGraphStore"

import { GRAPH_LAYOUT_TREE, SEARCH_ROOT_ID } from "./graphConstants"
import { GRAPH_NODE_TYPE } from "./graphNodeTypes"

type TreeDatum = {
  id: string
  children?: TreeDatum[]
}

function findLayoutRootId(nodes: AppNode[]): string {
  const inputRoot = nodes.find((node) => node.type === GRAPH_NODE_TYPE.input)
  if (inputRoot) {
    return inputRoot.id
  }

  const legacyRoot = nodes.find((node) => node.id === SEARCH_ROOT_ID)
  if (legacyRoot) {
    return legacyRoot.id
  }

  return nodes[0]?.id ?? ""
}

const buildHierarchyData = (
  rootId: string,
  nodes: AppNode[],
  edges: Edge[],
) => {
  const adjacency = new Map<string, string[]>()

  edges.forEach((edge) => {
    const source = String(edge.source)
    const target = String(edge.target)
    const current = adjacency.get(source) ?? []
    adjacency.set(source, [...current, target])
  })

  const visited = new Set<string>()

  const buildNode = (id: string): TreeDatum => {
    visited.add(id)
    const childrenIds = adjacency.get(id) ?? []
    const children = childrenIds
      .filter((childId) => !visited.has(childId))
      .map((childId) => buildNode(childId))

    return children.length ? { id, children } : { id }
  }

  const root = buildNode(rootId)
  const extraChildren = nodes
    .map((node) => node.id)
    .filter((nodeId) => !visited.has(nodeId))
    .map((nodeId) => ({ id: nodeId }))

  if (extraChildren.length > 0) {
    root.children = [...(root.children ?? []), ...extraChildren]
  }

  return root
}

export const applyTreeLayout = (nodes: AppNode[], edges: Edge[]) => {
  if (nodes.length === 0) {
    return nodes
  }

  const { nodeWidth, nodeHeight, horizontalGap, verticalGap, offsetY } =
    GRAPH_LAYOUT_TREE

  const rootId = findLayoutRootId(nodes)
  const hierarchyData = buildHierarchyData(rootId, nodes, edges)
  const root = hierarchy<TreeDatum>(hierarchyData)

  const layout = tree<TreeDatum>().nodeSize([
    nodeWidth + horizontalGap,
    nodeHeight + verticalGap,
  ])

  const layoutRoot = layout(root)
  const descendants: HierarchyPointNode<TreeDatum>[] = layoutRoot.descendants()
  const xValues = descendants.map((descendant) => descendant.x)
  const minX = Math.min(...xValues)
  const maxX = Math.max(...xValues)
  const offsetX = window.innerWidth / 2 - (minX + maxX) / 2

  const positionMap = new Map(
    descendants.map((descendant) => [descendant.data.id, descendant]),
  )

  return nodes.map((node) => {
    const descendant = positionMap.get(node.id)
    if (!descendant) {
      return node
    }

    return {
      ...node,
      position: {
        x: descendant.x + offsetX - nodeWidth / 2,
        y: descendant.y + offsetY,
      },
    }
  })
}
