import type { FollowTarget } from "@/entities/engagement/model/types"

export type ArticleComment = {
  id: number
  content: string
  author_name: string
  created_at: string
  is_own?: boolean
}

export type ArticleDetail = {
  id: number
  title: string | null
  url: string
  excerpt: string | null
  image_url: string | null
  date: string | null
  paywalled: boolean
  authors: string[]
  categories: string[]
  places: string[]
  comments: ArticleComment[]
  average_rating: number | null
  ratings_count: number
  user_rating: number | null
  is_favorited: boolean
  user_note: string | null
  user_note_updated_at: string | null
  follow_targets: FollowTarget[]
}
