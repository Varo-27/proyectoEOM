import { createDefaultInputNode, migrateGraphSnapshot } from "@/entities/graph"

import type {
  WorkspaceGraphSnapshot,
  WorkspaceRecord,
  WorkspaceStoragePayload,
} from "./types"
import { WORKSPACE_SCHEMA_VERSION } from "./types"

const STORAGE_KEY = "wse-workspaces-v1"
const GUEST_STORAGE_KEY = "wse-guest-session-v1"

/** Identificador fijo del único área de trabajo en modo invitado. */
export const GUEST_WORKSPACE_ID = "guest-session"

export function createEmptyGraphSnapshot(): WorkspaceGraphSnapshot {
  return {
    nodes: [createDefaultInputNode()],
    edges: [],
    viewport: null,
  }
}

export function createWorkspaceRecord(name: string): WorkspaceRecord {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    graph: createEmptyGraphSnapshot(),
    serverRevision: null,
  }
}

export function loadWorkspacesFromStorage(): WorkspaceStoragePayload | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as WorkspaceStoragePayload
    if (!parsed.workspaces?.length || !parsed.activeWorkspaceId) {
      return null
    }

    return {
      ...parsed,
      workspaces: parsed.workspaces.map((workspace) => ({
        ...workspace,
        graph: migrateGraphSnapshot(workspace.graph),
      })),
    }
  } catch {
    return null
  }
}

export function saveWorkspacesToStorage(
  payload: WorkspaceStoragePayload,
): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function buildDefaultStoragePayload(): WorkspaceStoragePayload {
  const workspace = createWorkspaceRecord("Investigación 1")

  return {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    activeWorkspaceId: workspace.id,
    workspaces: [workspace],
  }
}

export function buildGuestStoragePayload(): WorkspaceStoragePayload {
  const workspace = createWorkspaceRecord("Sesión de invitado")
  workspace.id = GUEST_WORKSPACE_ID

  return {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    activeWorkspaceId: GUEST_WORKSPACE_ID,
    workspaces: [workspace],
  }
}

export function loadGuestWorkspacesFromStorage(): WorkspaceStoragePayload | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.sessionStorage.getItem(GUEST_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as WorkspaceStoragePayload
    if (!parsed.workspaces?.length) {
      return null
    }

    const workspaces = parsed.workspaces.map((workspace) => ({
      ...workspace,
      id: GUEST_WORKSPACE_ID,
      graph: migrateGraphSnapshot(workspace.graph),
    }))

    return {
      ...parsed,
      activeWorkspaceId: GUEST_WORKSPACE_ID,
      workspaces,
    }
  } catch {
    return null
  }
}

export function saveGuestWorkspacesToStorage(
  payload: WorkspaceStoragePayload,
): void {
  window.sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(payload))
}

export function clearGuestWorkspacesFromStorage(): void {
  window.sessionStorage.removeItem(GUEST_STORAGE_KEY)
}
