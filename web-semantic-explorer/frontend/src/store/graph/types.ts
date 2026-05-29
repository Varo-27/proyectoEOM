import type { Connection, Edge, EdgeChange, Node, NodeChange } from "@xyflow/react"

/** Payload de datos compartido por nodos de artículo y búsqueda en React Flow. */
export type AppNodeData = {
  title: string
  label?: string
  excerpt?: string
  author_name?: string
  category_name?: string
  url?: string
  imageUrl?: string
  /** Retraso de animación de entrada (ms), asignado al crear el nodo. */
  appearDelay?: number
  [key: string]: unknown
}

export type AppNode = Node<AppNodeData>

export interface GraphState {
  nodes: AppNode[]
  edges: Edge[]
  isLoading: boolean
  activeNodeId: string | null
  selectedNode: AppNode | null
  modalOpen: boolean
  expandSimilar: ((nodeId: string) => void) | null

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setNodes: (nodes: AppNode[]) => void
  setEdges: (edges: Edge[]) => void
  setLoading: (loading: boolean) => void
  setActiveNodeId: (nodeId: string | null) => void
  setSelectedNode: (node: AppNode | null) => void
  setModalOpen: (open: boolean) => void
  setExpandSimilar: (handler: ((nodeId: string) => void) | null) => void
  clearGraph: () => void
}
