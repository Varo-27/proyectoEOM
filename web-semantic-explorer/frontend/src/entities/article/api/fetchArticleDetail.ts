import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"

import type { ArticleDetail } from "../model/types"

export function fetchArticleDetail(
  articleId: number,
): CancelablePromise<ArticleDetail> {
  return request(OpenAPI, {
    method: "GET",
    url: "/api/v1/articles/{article_id}",
    path: { article_id: articleId },
  })
}
