import { Heart } from "lucide-react"

import { isLoggedIn } from "@/shared/auth"
import useCustomToast from "@/shared/lib/useCustomToast"
import { cn } from "@/shared/lib/utils"

import { useToggleFavorite } from "../lib/useToggleFavorite"

type FavoriteButtonProps = {
  articleId: number
  isFavorited: boolean
}

export function FavoriteButton({ articleId, isFavorited }: FavoriteButtonProps) {
  const loggedIn = isLoggedIn()
  const { showErrorToast } = useCustomToast()
  const { mutate, isPending } = useToggleFavorite(articleId)

  return (
    <button
      type="button"
      disabled={!loggedIn || isPending}
      aria-busy={isPending || undefined}
      aria-pressed={isFavorited}
      onClick={() => {
        if (!loggedIn) {
          showErrorToast("Inicia sesión para guardar favoritos")
          return
        }
        mutate()
      }}
      className={cn(
        "graph-article-modal__favorite",
        isFavorited
          ? "graph-article-modal__favorite--active"
          : "graph-article-modal__favorite--idle",
        !loggedIn && "opacity-60",
      )}
    >
      <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
      {isFavorited ? "En favoritos" : "Favorito"}
    </button>
  )
}
