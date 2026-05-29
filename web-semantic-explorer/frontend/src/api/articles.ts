import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"

export type ArticleComment = {
  id: number
  content: string
  author_name: string
  created_at: string
  is_own?: boolean
}

export type ArticleDetail = {
  id: number
  title: string | null
  url: string
  excerpt: string | null
  image_url: string | null
  date: string | null
  paywalled: boolean
  authors: string[]
  categories: string[]
  places: string[]
  comments: ArticleComment[]
  average_rating: number | null
  ratings_count: number
  user_rating: number | null
  is_favorited: boolean
}

export type FavoriteStatus = {
  article_id: number
  is_favorited: boolean
}

export type RatingSummary = {
  article_id: number
  average_rating: number | null
  ratings_count: number
  user_rating: number | null
}

export type CommentRecord = {
  id: number
  article_id: number
  content: string
  author_name: string
  created_at: string
  updated_at: string | null
  is_own: boolean
}

export const articleDetailQueryKey = (articleId: number | string) =>
  ["article-detail", String(articleId)] as const

export function fetchArticleDetail(
  articleId: number,
): CancelablePromise<ArticleDetail> {
  return request(OpenAPI, {
    method: "GET",
    url: "/api/v1/articles/{article_id}",
    path: { article_id: articleId },
  })
}

export function toggleArticleFavorite(
  articleId: number,
): CancelablePromise<FavoriteStatus> {
  return request(OpenAPI, {
    method: "POST",
    url: "/api/v1/articles/{article_id}/favorite",
    path: { article_id: articleId },
  })
}

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
