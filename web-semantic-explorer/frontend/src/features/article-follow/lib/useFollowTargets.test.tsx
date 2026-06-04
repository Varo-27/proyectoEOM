// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { articleDetailQueryKey } from "@/entities/article"
import type { ArticleDetail } from "@/entities/article"
import { useFollowTargets } from "@/features/article-follow"

vi.mock("@/entities/engagement", () => ({
  followTarget: vi.fn(),
  unfollowTarget: vi.fn(),
}))

vi.mock("@/hooks/useCustomToast", () => ({
  default: () => ({
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
  }),
}))

const { followTarget } = await import("@/entities/engagement")

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe("useFollowTargets", () => {
  it("actualiza is_following del target en caché", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const articleId = 11
    queryClient.setQueryData<ArticleDetail>(articleDetailQueryKey(articleId), {
      id: articleId,
      title: "T",
      url: "https://example.com",
      excerpt: null,
      image_url: null,
      date: null,
      paywalled: false,
      authors: ["Autor"],
      categories: [],
      places: [],
      comments: [],
      average_rating: null,
      ratings_count: 0,
      user_rating: null,
      is_favorited: false,
      user_note: null,
      user_note_updated_at: null,
      follow_targets: [
        {
          target_type: "author",
          target_id: 5,
          label: "Autor",
          is_following: false,
        },
      ],
    })

    vi.mocked(followTarget).mockResolvedValue({
      target_type: "author",
      target_id: 5,
      is_following: true,
    })

    const { result } = renderHook(() => useFollowTargets(articleId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate({
      targetType: "author",
      targetId: 5,
      following: true,
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    const cached = queryClient.getQueryData<ArticleDetail>(
      articleDetailQueryKey(articleId),
    )
    expect(cached?.follow_targets?.[0]?.is_following).toBe(true)
  })
})
