import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"

import type { FavoriteStatus } from "../model/types"

export function toggleArticleFavorite(
  articleId: number,
): CancelablePromise<FavoriteStatus> {
  return request(OpenAPI, {
    method: "POST",
    url: "/api/v1/articles/{article_id}/favorite",
    path: { article_id: articleId },
  })
}
