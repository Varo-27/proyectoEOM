import { useMutation, useQueryClient } from "@tanstack/react-query"

import { patchArticleDetailCache } from "@/entities/article/lib/patchArticleDetailCache"
import { upsertArticleRating } from "@/entities/engagement"
import useCustomToast from "@/shared/lib/useCustomToast"

export function useArticleRating(articleId: number) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (value: number) => upsertArticleRating(articleId, value),
    onSuccess: (summary) => {
      patchArticleDetailCache(queryClient, articleId, {
        user_rating: summary.user_rating,
        average_rating: summary.average_rating,
        ratings_count: summary.ratings_count,
      })
      showSuccessToast("Valoración guardada")
    },
    onError: () => showErrorToast("No se pudo guardar la valoración"),
  })

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}
