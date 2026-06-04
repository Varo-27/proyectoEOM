import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"

import type { FollowStatus } from "../model/types"

export function followTarget(
  targetType: string,
  targetId: number,
): CancelablePromise<FollowStatus> {
  return request(OpenAPI, {
    method: "POST",
    url: "/api/v1/follows",
    body: { target_type: targetType, target_id: targetId },
    mediaType: "application/json",
  })
}

export function unfollowTarget(
  targetType: string,
  targetId: number,
): CancelablePromise<FollowStatus> {
  return request(OpenAPI, {
    method: "DELETE",
    url: "/api/v1/follows",
    query: { target_type: targetType, target_id: targetId },
  })
}
