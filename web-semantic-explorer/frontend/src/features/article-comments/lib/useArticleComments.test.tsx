// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { articleDetailQueryKey } from "@/entities/article"
import { useArticleComments } from "@/features/article-comments"

vi.mock("@/entities/engagement", () => ({
  createArticleComment: vi.fn(),
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
}))

vi.mock("@/hooks/useCustomToast", () => ({
  default: () => ({
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
  }),
}))

const { createArticleComment } = await import("@/entities/engagement")

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe("useArticleComments", () => {
  it("invalida la query del detalle tras crear comentario", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const articleId = 3
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")

    vi.mocked(createArticleComment).mockResolvedValue({
      id: 1,
      article_id: articleId,
      content: "Hola",
      author_name: "Tester",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: null,
      is_own: true,
    })

    const { result } = renderHook(() => useArticleComments(articleId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.createComment("Hola")

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: articleDetailQueryKey(articleId),
    })
  })
})
