export function formatArticleDate(value: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}
