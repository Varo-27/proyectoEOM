import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react"
import { create } from "zustand"

export type AppNodeData = {
  title: string
  label?: string
  excerpt?: string
  author_name?: string
  category_name?: string
  url?: string
  imageUrl?: string
  [key: string]: any
}

export type AppNode = Node<AppNodeData>

interface GraphState {
  nodes: AppNode[]
  edges: Edge[]
  isLoading: boolean
  selectedNode: AppNode | null

  // Actions
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setNodes: (nodes: AppNode[]) => void
  setEdges: (edges: Edge[]) => void
  addNodes: (nodes: AppNode[]) => void
  addEdges: (edges: Edge[]) => void
  setLoading: (loading: boolean) => void
  setSelectedNode: (node: AppNode | null) => void
  clearGraph: () => void
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  isLoading: false,
  selectedNode: null,

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

  addNodes: (newNodes) => set({ nodes: [...get().nodes, ...newNodes] }),
  addEdges: (newEdges) => set({ edges: [...get().edges, ...newEdges] }),

  setLoading: (isLoading) => set({ isLoading }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),

  clearGraph: () => set({ nodes: [], edges: [], selectedNode: null }),
}))
