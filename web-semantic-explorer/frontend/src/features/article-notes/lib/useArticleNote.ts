import { useMutation, useQueryClient } from "@tanstack/react-query"

import { patchArticleDetailCache } from "@/entities/article/lib/patchArticleDetailCache"
import { upsertArticleNote } from "@/entities/engagement"
import useCustomToast from "@/shared/lib/useCustomToast"

export function useArticleNote(articleId: number) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (content: string) => upsertArticleNote(articleId, content),
    onSuccess: (note) => {
      patchArticleDetailCache(queryClient, articleId, {
        user_note: note.content || null,
        user_note_updated_at: note.updated_at,
      })
      showSuccessToast("Nota guardada")
    },
    onError: () => showErrorToast("No se pudo guardar la nota"),
  })

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}
