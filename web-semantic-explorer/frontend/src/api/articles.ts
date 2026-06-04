/** @deprecated Import from `@/entities/article` or `@/entities/engagement` instead. */
export type { ArticleComment, ArticleDetail } from "@/entities/article"
export { articleDetailQueryKey, fetchArticleDetail } from "@/entities/article"
export type {
  ArticleNote,
  CommentRecord,
  FavoriteStatus,
  FollowStatus,
  FollowTarget,
  RatingSummary,
} from "@/entities/engagement"
export {
  createArticleComment,
  deleteComment,
  followTarget,
  toggleArticleFavorite,
  unfollowTarget,
  updateComment,
  upsertArticleNote,
  upsertArticleRating,
  fetchArticleNote,
} from "@/entities/engagement"
