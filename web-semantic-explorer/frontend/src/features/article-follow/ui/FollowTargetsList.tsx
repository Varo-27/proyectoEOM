import { UserPlus } from "lucide-react"

import type { FollowTarget } from "@/entities/engagement"
import { isLoggedIn } from "@/shared/auth"
import { cn } from "@/shared/lib/utils"

import { useFollowTargets } from "../lib/useFollowTargets"

type FollowTargetsListProps = {
  articleId: number
  targets: FollowTarget[]
}

function followTargetLabel(targetType: string) {
  if (targetType === "author") return "Autor"
  if (targetType === "category") return "Categoría"
  return targetType
}

export function FollowTargetsList({
  articleId,
  targets,
}: FollowTargetsListProps) {
  const loggedIn = isLoggedIn()
  const { mutate, isPending } = useFollowTargets(articleId)

  if (!loggedIn || targets.length === 0) {
    return null
  }

  return (
    <section className="graph-article-modal__section">
      <div className="graph-article-modal__section-label">
        <UserPlus className="h-3.5 w-3.5 shrink-0" />
        Seguir
      </div>
      <div className="flex flex-col gap-2">
        {targets.map((target) => (
          <button
            key={`${target.target_type}-${target.target_id}`}
            type="button"
            disabled={isPending}
            aria-pressed={target.is_following}
            onClick={() =>
              mutate({
                targetType: target.target_type,
                targetId: target.target_id,
                following: !target.is_following,
              })
            }
            className={cn(
              "graph-article-modal__follow-btn",
              target.is_following && "graph-article-modal__follow-btn--active",
            )}
          >
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {followTargetLabel(target.target_type)}
            </span>
            <span className="font-medium">{target.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
