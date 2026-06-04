import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"

import type { RatingSummary } from "../model/types"

export function upsertArticleRating(
  articleId: number,
  value: number,
): CancelablePromise<RatingSummary> {
  return request(OpenAPI, {
    method: "POST",
    url: "/api/v1/articles/{article_id}/rating",
    path: { article_id: articleId },
    body: { value },
    mediaType: "application/json",
  })
}
