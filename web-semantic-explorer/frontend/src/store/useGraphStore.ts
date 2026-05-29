import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react"
import { create } from "zustand"

import type { AppNode, GraphState } from "./graph/types"

export type { AppNode, AppNodeData, GraphState } from "./graph/types"

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  isLoading: false,
  activeNodeId: null,
  selectedNode: null,
  modalOpen: false,
  expandSimilar: null,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as AppNode[],
    })
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    })
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  setLoading: (isLoading) => set({ isLoading }),
  setActiveNodeId: (activeNodeId) => set({ activeNodeId }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setModalOpen: (modalOpen) => set({ modalOpen }),
  setExpandSimilar: (expandSimilar) => set({ expandSimilar }),

  clearGraph: () =>
    set({
      nodes: [],
      edges: [],
      activeNodeId: null,
      selectedNode: null,
      modalOpen: false,
    }),
}))
