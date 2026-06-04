import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"

import type { ArticleNote } from "../model/types"

export function fetchArticleNote(
  articleId: number,
): CancelablePromise<ArticleNote> {
  return request(OpenAPI, {
    method: "GET",
    url: "/api/v1/articles/{article_id}/note",
    path: { article_id: articleId },
  })
}

export function upsertArticleNote(
  articleId: number,
  content: string,
): CancelablePromise<ArticleNote> {
  return request(OpenAPI, {
    method: "PUT",
    url: "/api/v1/articles/{article_id}/note",
    path: { article_id: articleId },
    body: { content },
    mediaType: "application/json",
  })
}
