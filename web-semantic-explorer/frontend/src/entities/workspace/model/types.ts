import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph"

/** Versión del snapshot para migraciones futuras (local y servidor). */
export const WORKSPACE_SCHEMA_VERSION = 1 as const

export type WorkspaceSchemaVersion = typeof WORKSPACE_SCHEMA_VERSION

export type WorkspaceViewport = {
  x: number
  y: number
  zoom: number
}

/** Estado serializable del lienzo (cuerpo listo para POST/PATCH al servidor). */
export type WorkspaceGraphSnapshot = {
  nodes: AppNode[]
  edges: Edge[]
  viewport: WorkspaceViewport | null
}

export type WorkspaceRecord = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  schemaVersion: WorkspaceSchemaVersion
  graph: WorkspaceGraphSnapshot
  /** Revision del servidor cuando exista sync multi-dispositivo. */
  serverRevision: string | null
}

/** Payload completo en localStorage / respuesta GET /workspaces. */
export type WorkspaceStoragePayload = {
  schemaVersion: WorkspaceSchemaVersion
  activeWorkspaceId: string
  workspaces: WorkspaceRecord[]
}

/** Cuerpo para crear/actualizar en API (Fase 6d). */
export type WorkspaceApiBody = {
  id: string
  name: string
  schema_version: WorkspaceSchemaVersion
  updated_at: string
  graph: WorkspaceGraphSnapshot
  server_revision?: string | null
}

export function workspaceToApiBody(
  workspace: WorkspaceRecord,
): WorkspaceApiBody {
  return {
    id: workspace.id,
    name: workspace.name,
    schema_version: workspace.schemaVersion,
    updated_at: workspace.updatedAt,
    graph: workspace.graph,
    server_revision: workspace.serverRevision,
  }
}
