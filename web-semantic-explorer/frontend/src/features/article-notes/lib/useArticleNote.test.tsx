// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { articleDetailQueryKey } from "@/entities/article"
import type { ArticleDetail } from "@/entities/article"
import { useArticleNote } from "@/features/article-notes"

vi.mock("@/entities/engagement", () => ({
  upsertArticleNote: vi.fn(),
}))

vi.mock("@/hooks/useCustomToast", () => ({
  default: () => ({
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
  }),
}))

const { upsertArticleNote } = await import("@/entities/engagement")

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe("useArticleNote", () => {
  it("guarda user_note en caché", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const articleId = 9
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
      average_rating: null,
      ratings_count: 0,
      user_rating: null,
      is_favorited: false,
      user_note: null,
      user_note_updated_at: null,
      follow_targets: [],
    })

    vi.mocked(upsertArticleNote).mockResolvedValue({
      article_id: articleId,
      content: "Mi nota",
      updated_at: "2026-06-01T12:00:00Z",
    })

    const { result } = renderHook(() => useArticleNote(articleId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate("Mi nota")

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    expect(
      queryClient.getQueryData<ArticleDetail>(articleDetailQueryKey(articleId))
        ?.user_note,
    ).toBe("Mi nota")
  })
})
