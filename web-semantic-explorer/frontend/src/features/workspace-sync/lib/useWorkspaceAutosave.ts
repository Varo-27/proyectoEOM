import { useEffect, useRef } from "react"

import { useGraphStore } from "@/entities/graph"
import type { WorkspaceViewport } from "@/entities/workspace"
import { useWorkspaceStore } from "@/entities/workspace"

const AUTOSAVE_MS = 800

type UseWorkspaceAutosaveOptions = {
  getViewport: () => WorkspaceViewport | null
  enabled?: boolean
}

/**
 * Persiste el área activa en localStorage cuando cambia el grafo o la cámara.
 */
export function useWorkspaceAutosave({
  getViewport,
  enabled = true,
}: UseWorkspaceAutosaveOptions) {
  const isHydrated = useWorkspaceStore((state) => state.isHydrated)
  const captureActiveWorkspace = useWorkspaceStore(
    (state) => state.captureActiveWorkspace,
  )
  const markDirty = useWorkspaceStore((state) => state.markDirty)

  const graphRevision = useGraphStore((state) => state.graphRevision)

  const getViewportRef = useRef(getViewport)
  getViewportRef.current = getViewport

  useEffect(() => {
    if (!enabled || !isHydrated) {
      return
    }

    markDirty()

    const timer = window.setTimeout(() => {
      captureActiveWorkspace(getViewportRef.current())
      void useWorkspaceStore.getState().pushToServer()
    }, AUTOSAVE_MS)

    return () => window.clearTimeout(timer)
  }, [enabled, isHydrated, captureActiveWorkspace, markDirty, graphRevision])
}
