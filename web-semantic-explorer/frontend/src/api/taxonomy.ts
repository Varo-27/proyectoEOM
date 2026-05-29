import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"

export type AuthorOption = {
  name: string
}

export type AuthorsListResponse = {
  authors: AuthorOption[]
}

export function listAuthors(): CancelablePromise<AuthorsListResponse> {
  return request(OpenAPI, {
    method: "GET",
    url: "/api/v1/taxonomy/authors",
  })
}
