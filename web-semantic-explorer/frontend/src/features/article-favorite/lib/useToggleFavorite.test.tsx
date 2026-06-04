// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { articleDetailQueryKey } from "@/entities/article"
import type { ArticleDetail } from "@/entities/article"
import { useToggleFavorite } from "@/features/article-favorite"

vi.mock("@/entities/engagement", () => ({
  toggleArticleFavorite: vi.fn(),
}))

vi.mock("@/hooks/useCustomToast", () => ({
  default: () => ({
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
  }),
}))

const { toggleArticleFavorite } = await import("@/entities/engagement")

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe("useToggleFavorite", () => {
  it("actualiza is_favorited en la caché del detalle", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const articleId = 42
    const detail: ArticleDetail = {
      id: articleId,
      title: "Test",
      url: "https://example.com",
      excerpt: null,
      image_url: null,
      date: null,
      paywalled: false,
      authors: [],
      categories: [],
      places: [],
      comments: [],
      average_rating: null,
      ratings_count: 0,
      user_rating: null,
      is_favorited: false,
      user_note: null,
      user_note_updated_at: null,
      follow_targets: [],
    }
    queryClient.setQueryData(articleDetailQueryKey(articleId), detail)

    vi.mocked(toggleArticleFavorite).mockResolvedValue({
      article_id: articleId,
      is_favorited: true,
    })

    const { result } = renderHook(() => useToggleFavorite(articleId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate()

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    expect(
      queryClient.getQueryData<ArticleDetail>(articleDetailQueryKey(articleId))
        ?.is_favorited,
    ).toBe(true)
  })
})
