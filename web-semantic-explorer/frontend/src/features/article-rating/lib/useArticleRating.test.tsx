// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { articleDetailQueryKey } from "@/entities/article"
import type { ArticleDetail } from "@/entities/article"
import { useArticleRating } from "@/features/article-rating"

vi.mock("@/entities/engagement", () => ({
  upsertArticleRating: vi.fn(),
}))

vi.mock("@/shared/lib/useCustomToast", () => ({
  default: () => ({
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
  }),
}))

const { upsertArticleRating } = await import("@/entities/engagement")

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe("useArticleRating", () => {
  it("parchea user_rating y resumen en caché", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const articleId = 7
    queryClient.setQueryData<ArticleDetail>(articleDetailQueryKey(articleId), {
      id: articleId,
      title: "T",
      url: "https://example.com",
      excerpt: null,
      image_url: null,
      date: null,
      paywalled: false,
      authors: [],
      categories: [],
      places: [],
      comments: [],
      average_rating: 3,
      ratings_count: 1,
      user_rating: null,
      is_favorited: false,
      user_note: null,
      user_note_updated_at: null,
      follow_targets: [],
    })

    vi.mocked(upsertArticleRating).mockResolvedValue({
      article_id: articleId,
      average_rating: 4,
      ratings_count: 2,
      user_rating: 4,
    })

    const { result } = renderHook(() => useArticleRating(articleId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(4)

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    const cached = queryClient.getQueryData<ArticleDetail>(
      articleDetailQueryKey(articleId),
    )
    expect(cached?.user_rating).toBe(4)
    expect(cached?.average_rating).toBe(4)
    expect(cached?.ratings_count).toBe(2)
  })
})
