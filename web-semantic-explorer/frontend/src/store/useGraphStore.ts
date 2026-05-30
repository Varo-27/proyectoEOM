import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type NodeChange,
} from "@xyflow/react"
import { create } from "zustand"

import { syncLinkedContextFlags } from "@/components/Graph/context/syncLinkedContextFlags"
import { deleteGraphNode } from "@/components/Graph/graph/deleteGraphNode"
import { isPositionOnlyChange } from "@/components/Graph/graphFlowDrag"

import type { AppNode, GraphState } from "./graph/types"

function isPositionChangeWhileDragging(changes: NodeChange[]): boolean {
  return (
    changes.length > 0 &&
    changes.every(
      (change) =>
        change.type === "position" &&
        "dragging" in change &&
        change.dragging === true,
    )
  )
}

export type { AppNode, AppNodeData, GraphState } from "./graph/types"

function nextRevision(state: GraphState): number {
  return state.graphRevision + 1
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  graphRevision: 0,
  isLoading: false,
  activeNodeId: null,
  selectedNode: null,
  modalOpen: false,
  expandSimilar: null,
  searchFromInput: null,

  onNodesChange: (changes) => {
    const nextNodes = applyNodeChanges(changes, get().nodes) as AppNode[]

    if (isPositionChangeWhileDragging(changes)) {
      set({ nodes: nextNodes })
      return
    }

    if (isPositionOnlyChange(changes)) {
      set((state) => ({
        nodes: nextNodes,
        graphRevision: nextRevision(state),
      }))
      return
    }

    set((state) => ({
      nodes: syncLinkedContextFlags(nextNodes, state.edges),
      graphRevision: nextRevision(state),
    }))
  },

  onEdgesChange: (changes) => {
    const nextEdges = applyEdgeChanges(changes, get().edges)
    set((state) => ({
      edges: nextEdges,
      nodes: syncLinkedContextFlags(state.nodes, nextEdges),
      graphRevision: nextRevision(state),
    }))
  },

  onConnect: (connection) => {
    const nextEdges = addEdge(connection, get().edges)
    set((state) => ({
      edges: nextEdges,
      nodes: syncLinkedContextFlags(state.nodes, nextEdges),
      graphRevision: nextRevision(state),
    }))
  },

  setNodes: (nodes) =>
    set((state) => ({
      nodes: syncLinkedContextFlags(nodes, state.edges),
      graphRevision: nextRevision(state),
    })),

  commitNodes: (nodes, changes) => {
    const edges = get().edges
    const positionOnly = changes ? isPositionOnlyChange(changes) : false

    if (positionOnly) {
      const positionsById = new Map(
        nodes.map((node) => [node.id, node.position] as const),
      )

      set((state) => ({
        nodes: state.nodes.map((node) => {
          const position = positionsById.get(node.id)
          if (!position) {
            return node
          }
          if (
            node.position.x === position.x &&
            node.position.y === position.y
          ) {
            return node
          }
          return { ...node, position }
        }),
        graphRevision: nextRevision(state),
      }))
      return
    }

    set((state) => ({
      nodes: syncLinkedContextFlags(nodes, edges),
      graphRevision: nextRevision(state),
    }))
  },

  setEdges: (edges) =>
    set((state) => ({
      edges,
      nodes: syncLinkedContextFlags(state.nodes, edges),
      graphRevision: nextRevision(state),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setActiveNodeId: (activeNodeId) => set({ activeNodeId }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setModalOpen: (modalOpen) => set({ modalOpen }),
  setExpandSimilar: (expandSimilar) => set({ expandSimilar }),
  setSearchFromInput: (searchFromInput) => set({ searchFromInput }),

  removeNode: (nodeId) => {
    const state = get()
    const { nodes, edges } = deleteGraphNode(nodeId, state.nodes, state.edges)

    const nextActiveId =
      state.activeNodeId === nodeId ? null : state.activeNodeId
    const nextSelected =
      state.selectedNode?.id === nodeId ? null : state.selectedNode

    set((prev) => ({
      nodes: syncLinkedContextFlags(nodes, edges),
      edges,
      activeNodeId: nextActiveId,
      selectedNode: nextSelected,
      modalOpen: nextSelected ? state.modalOpen : false,
      graphRevision: nextRevision(prev),
    }))
  },

  removeEdges: (edgeIds) => {
    const ids = new Set(edgeIds)
    const nextEdges = get().edges.filter((edge) => !ids.has(edge.id))
    set((state) => ({
      edges: nextEdges,
      nodes: syncLinkedContextFlags(state.nodes, nextEdges),
      graphRevision: nextRevision(state),
    }))
  },

  clearGraph: () =>
    set((state) => ({
      nodes: [],
      edges: [],
      activeNodeId: null,
      selectedNode: null,
      modalOpen: false,
      graphRevision: nextRevision(state),
    })),
}))
