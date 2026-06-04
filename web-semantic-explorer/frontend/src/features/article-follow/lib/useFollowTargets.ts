import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { ArticleDetail } from "@/entities/article"
import { articleDetailQueryKey } from "@/entities/article"
import { followTarget, unfollowTarget } from "@/entities/engagement"
import useCustomToast from "@/shared/lib/useCustomToast"

export function useFollowTargets(articleId: number) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const detailKey = articleDetailQueryKey(articleId)

  const mutation = useMutation({
    mutationFn: ({
      targetType,
      targetId,
      following,
    }: {
      targetType: string
      targetId: number
      following: boolean
    }) =>
      following
        ? followTarget(targetType, targetId)
        : unfollowTarget(targetType, targetId),
    onSuccess: (status) => {
      queryClient.setQueryData<ArticleDetail>(detailKey, (current) =>
        current
          ? {
              ...current,
              follow_targets: (current.follow_targets ?? []).map((target) =>
                target.target_type === status.target_type &&
                target.target_id === status.target_id
                  ? { ...target, is_following: status.is_following }
                  : target,
              ),
            }
          : current,
      )
      showSuccessToast(
        status.is_following ? "Seguimiento activado" : "Seguimiento desactivado",
      )
    },
    onError: () => showErrorToast("No se pudo actualizar el seguimiento"),
  })

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}
