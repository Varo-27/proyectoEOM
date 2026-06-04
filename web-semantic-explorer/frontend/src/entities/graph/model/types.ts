import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "@xyflow/react"

/** Payload de datos compartido por nodos de artículo y búsqueda en React Flow. */
export type AppNodeData = {
  title: string
  label?: string
  excerpt?: string
  author_name?: string
  category_name?: string
  url?: string
  imageUrl?: string
  /** Pie de foto (cuando exista en origen). */
  imageCaption?: string
  /** Retraso de animación de entrada (ms), asignado al crear el nodo. */
  appearDelay?: number
  /** Artículo con input/filtro conectado downstream (sync topología). */
  hasLinkedDownstreamContext?: boolean
  /** Marca de visita persistida en workspace (ISO timestamp). */
  visitedAt?: string
  query?: string
  filterKey?: string
  filterValue?: string | number
  [key: string]: unknown
}

export type AppNode = Node<AppNodeData>

export interface GraphState {
  nodes: AppNode[]
  edges: Edge[]
  /** Incrementa en cambios de topología o al soltar un nodo (no en cada frame de drag). */
  graphRevision: number
  isLoading: boolean
  activeNodeId: string | null
  selectedNode: AppNode | null
  modalOpen: boolean
  expandSimilar: ((nodeId: string) => void) | null
  searchFromInput: ((inputNodeId: string, query: string) => void) | null

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => boolean
  setNodes: (nodes: AppNode[]) => void
  commitNodes: (nodes: AppNode[], changes?: NodeChange[]) => void
  setEdges: (edges: Edge[]) => void
  setLoading: (loading: boolean) => void
  setActiveNodeId: (nodeId: string | null) => void
  setSelectedNode: (node: AppNode | null) => void
  setModalOpen: (open: boolean) => void
  setExpandSimilar: (handler: ((nodeId: string) => void) | null) => void
  setSearchFromInput: (
    handler: ((inputNodeId: string, query: string) => void) | null,
  ) => void
  removeNode: (nodeId: string) => void
  removeEdges: (edgeIds: string[]) => void
  clearGraph: () => void
}
