import type { AppNode } from "@/store/useGraphStore"

import { useGraphExpand } from "@/features/graph-expand"
import { useGraphSearch } from "./useGraphSearch"

type GraphExplorerActionsDeps = {
  setNodes: (nodes: AppNode[]) => void
  setLoading: (loading: boolean) => void
  setActiveNodeId: (nodeId: string | null) => void
  setSelectedNode: (node: AppNode | null) => void
  setModalOpen: (open: boolean) => void
  centerViewportOnNode: (nodeId: string) => void
}

/** @deprecated Prefer `useGraphSearch` and `useGraphExpand` separately. */
export function useGraphExplorerActions(deps: GraphExplorerActionsDeps) {
  const { expandSimilarFromNode } = useGraphExpand(deps)
  const { searchFromInputNode } = useGraphSearch(deps)
  return { expandSimilarFromNode, searchFromInputNode }
}
