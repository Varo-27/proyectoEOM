import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"

import type {
  WorkspaceApiBody,
  WorkspaceRecord,
  WorkspaceStoragePayload,
} from "@/entities/workspace"

export type FavoriteArticle = {
  article_id: number
  title: string | null
  excerpt: string | null
  image_url: string | null
  url: string
  authors: string[]
  categories: string[]
  favorited_at: string
}

export type FavoritesListResponse = {
  data: FavoriteArticle[]
  count: number
}

export function fetchFavorites(): CancelablePromise<FavoritesListResponse> {
  return request(OpenAPI, {
    method: "GET",
    url: "/api/v1/favorites",
  })
}

export type WorkspaceSyncResponse = {
  schema_version: number
  active_workspace_id: string
  workspaces: Array<{
    id: string
    name: string
    schema_version: number
    graph: WorkspaceRecord["graph"]
    server_revision: string
    created_at: string
    updated_at: string
  }>
}

function toWorkspaceRecord(
  remote: WorkspaceSyncResponse["workspaces"][number],
): WorkspaceRecord {
  return {
    id: remote.id,
    name: remote.name,
    createdAt: remote.created_at,
    updatedAt: remote.updated_at,
    schemaVersion: remote.schema_version as WorkspaceRecord["schemaVersion"],
    graph: remote.graph,
    serverRevision: remote.server_revision,
  }
}

export function fetchWorkspaceSync(): CancelablePromise<WorkspaceSyncResponse> {
  return request(OpenAPI, {
    method: "GET",
    url: "/api/v1/workspaces/sync",
  })
}

export function pushWorkspaceSync(
  payload: WorkspaceStoragePayload,
): CancelablePromise<WorkspaceSyncResponse> {
  const body = {
    schema_version: payload.schemaVersion,
    active_workspace_id: payload.activeWorkspaceId,
    workspaces: payload.workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      schema_version: workspace.schemaVersion,
      updated_at: workspace.updatedAt,
      graph: workspace.graph,
      server_revision: workspace.serverRevision,
    })),
  }

  return request(OpenAPI, {
    method: "PUT",
    url: "/api/v1/workspaces/sync",
    body,
    mediaType: "application/json",
  })
}

export function syncResponseToStoragePayload(
  response: WorkspaceSyncResponse,
): WorkspaceStoragePayload {
  return {
    schemaVersion: response.schema_version as WorkspaceStoragePayload["schemaVersion"],
    activeWorkspaceId: response.active_workspace_id,
    workspaces: response.workspaces.map(toWorkspaceRecord),
  }
}

export type { WorkspaceApiBody }
