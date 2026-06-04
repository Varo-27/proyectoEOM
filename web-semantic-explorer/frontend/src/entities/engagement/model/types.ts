export type FollowTarget = {
  target_type: "author" | "category" | "topic" | "article" | string
  target_id: number
  label: string
  is_following: boolean
}

export type ArticleNote = {
  article_id: number
  content: string
  updated_at: string | null
}

export type FollowStatus = {
  target_type: string
  target_id: number
  is_following: boolean
}

export type FavoriteStatus = {
  article_id: number
  is_favorited: boolean
}

export type RatingSummary = {
  article_id: number
  average_rating: number | null
  ratings_count: number
  user_rating: number | null
}

export type CommentRecord = {
  id: number
  article_id: number
  content: string
  author_name: string
  created_at: string
  updated_at: string | null
  is_own: boolean
}
