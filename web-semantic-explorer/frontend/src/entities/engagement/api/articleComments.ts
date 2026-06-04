import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"

import type { CommentRecord } from "../model/types"

export function createArticleComment(
  articleId: number,
  content: string,
): CancelablePromise<CommentRecord> {
  return request(OpenAPI, {
    method: "POST",
    url: "/api/v1/articles/{article_id}/comments",
    path: { article_id: articleId },
    body: { content },
    mediaType: "application/json",
  })
}

export function updateComment(
  commentId: number,
  content: string,
): CancelablePromise<CommentRecord> {
  return request(OpenAPI, {
    method: "PATCH",
    url: "/api/v1/comments/{comment_id}",
    path: { comment_id: commentId },
    body: { content },
    mediaType: "application/json",
  })
}

export function deleteComment(commentId: number): CancelablePromise<void> {
  return request(OpenAPI, {
    method: "DELETE",
    url: "/api/v1/comments/{comment_id}",
    path: { comment_id: commentId },
  })
}
