import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react"
import { create } from "zustand"

import { emptyFilters } from "@/lib/filters"

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
  filters: emptyFilters(),

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

  setFilters: (filters) => set({ filters }),
  updateFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
    })),
  clearFilters: () => set({ filters: emptyFilters() }),

  clearGraph: () =>
    set({
      nodes: [],
      edges: [],
      activeNodeId: null,
      selectedNode: null,
      modalOpen: false,
    }),
}))
