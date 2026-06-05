import { Bell, BellRing, MapPin, Tag, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import type { FollowTarget } from "@/entities/engagement"
import { useFollowTargets } from "@/features/article-follow"
import { isLoggedIn } from "@/shared/auth"
import { cn } from "@/shared/lib/utils"

type ArticleModalTaxonomyProps = {
  articleId: number
  categories: string[]
  places: string[]
  authors: string[]
  followTargets: FollowTarget[]
}

type TaxonomyChipProps = {
  label: string
  followTarget?: FollowTarget
  canFollow: boolean
  isPending: boolean
  onToggle?: (target: FollowTarget) => void
}

type TaxonomyGroupProps = {
  label: string
  icon: LucideIcon
  children: ReactNode
}

function findFollowTarget(
  targets: FollowTarget[],
  targetType: string,
  label: string,
) {
  return targets.find(
    (target) => target.target_type === targetType && target.label === label,
  )
}

function TaxonomyGroup({ label, icon: Icon, children }: TaxonomyGroupProps) {
  return (
    <section className="graph-article-modal__taxonomy-group">
      <h3 className="graph-article-modal__taxonomy-label">
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        {label}
      </h3>
      <div className="graph-article-modal__taxonomy-chips">{children}</div>
    </section>
  )
}

function TaxonomyChip({
  label,
  followTarget,
  canFollow,
  isPending,
  onToggle,
}: TaxonomyChipProps) {
  const following = followTarget?.is_following ?? false
  const interactive = canFollow && followTarget && onToggle

  const content = (
    <>
      <span className="graph-article-modal__taxon-label">{label}</span>
      {interactive &&
        (following ? (
          <BellRing
            className="graph-article-modal__taxon-follow-icon graph-article-modal__taxon-follow-icon--active"
            aria-hidden
          />
        ) : (
          <Bell className="graph-article-modal__taxon-follow-icon" aria-hidden />
        ))}
    </>
  )

  if (interactive) {
    return (
      <button
        type="button"
        disabled={isPending}
        aria-pressed={following}
        aria-label={
          following ? `Dejar de seguir ${label}` : `Seguir ${label}`
        }
        onClick={() => onToggle(followTarget)}
        className={cn(
          "graph-article-modal__taxon-chip",
          following && "graph-article-modal__taxon-chip--following",
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <span className="graph-article-modal__taxon-chip graph-article-modal__taxon-chip--static">
      {content}
    </span>
  )
}

export function ArticleModalTaxonomy({
  articleId,
  categories,
  places,
  authors,
  followTargets,
}: ArticleModalTaxonomyProps) {
  const loggedIn = isLoggedIn()
  const { mutate, isPending } = useFollowTargets(articleId)

  const hasItems =
    categories.length > 0 || places.length > 0 || authors.length > 0

  if (!hasItems) return null

  const handleToggle = (target: FollowTarget) => {
    mutate({
      targetType: target.target_type,
      targetId: target.target_id,
      following: !target.is_following,
    })
  }

  return (
    <div className="graph-article-modal__taxonomy">
      {categories.length > 0 && (
        <TaxonomyGroup label="Categorías" icon={Tag}>
          {categories.map((category) => (
            <TaxonomyChip
              key={category}
              label={category}
              followTarget={findFollowTarget(
                followTargets,
                "category",
                category,
              )}
              canFollow={loggedIn}
              isPending={isPending}
              onToggle={handleToggle}
            />
          ))}
        </TaxonomyGroup>
      )}

      {places.length > 0 && (
        <TaxonomyGroup label="Lugares" icon={MapPin}>
          {places.map((place) => (
            <TaxonomyChip
              key={place}
              label={place}
              canFollow={false}
              isPending={false}
            />
          ))}
        </TaxonomyGroup>
      )}

      {authors.length > 0 && (
        <TaxonomyGroup label="Autores" icon={User}>
          {authors.map((author) => (
            <TaxonomyChip
              key={author}
              label={author}
              followTarget={findFollowTarget(followTargets, "author", author)}
              canFollow={loggedIn}
              isPending={isPending}
              onToggle={handleToggle}
            />
          ))}
        </TaxonomyGroup>
      )}
    </div>
  )
}
