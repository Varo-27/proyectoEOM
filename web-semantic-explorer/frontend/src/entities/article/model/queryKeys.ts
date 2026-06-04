export const articleDetailQueryKey = (articleId: number | string) =>
  ["article-detail", String(articleId)] as const
