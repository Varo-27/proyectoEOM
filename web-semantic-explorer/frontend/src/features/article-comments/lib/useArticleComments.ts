import { useMutation, useQueryClient } from "@tanstack/react-query"

import { articleDetailQueryKey } from "@/entities/article"
import {
  createArticleComment,
  deleteComment,
  updateComment,
} from "@/entities/engagement"
import useCustomToast from "@/shared/lib/useCustomToast"

export function useArticleComments(articleId: number) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const detailKey = articleDetailQueryKey(articleId)

  const createMutation = useMutation({
    mutationFn: (content: string) => createArticleComment(articleId, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: detailKey })
      showSuccessToast("Comentario publicado")
    },
    onError: () => showErrorToast("No se pudo publicar el comentario"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      updateComment(id, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: detailKey })
      showSuccessToast("Comentario actualizado")
    },
    onError: () => showErrorToast("No se pudo editar el comentario"),
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: detailKey })
      showSuccessToast("Comentario eliminado")
    },
    onError: () => showErrorToast("No se pudo eliminar el comentario"),
  })

  return {
    createComment: createMutation.mutate,
    updateComment: updateMutation.mutate,
    deleteComment: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    error:
      createMutation.error ?? updateMutation.error ?? deleteMutation.error,
  }
}
