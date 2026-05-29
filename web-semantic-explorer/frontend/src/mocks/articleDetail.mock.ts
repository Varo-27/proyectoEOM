import type { AppNode } from "@/store/useGraphStore"

export type ArticleComment = {
  id: number
  content: string
  author_name: string
  created_at: string
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
}

const MOCK_CATEGORIES = [
  "Geopolítica",
  "Defensa",
  "Economía internacional",
  "Energía",
  "Relaciones exteriores",
  "Seguridad",
]

const MOCK_PLACES = [
  "Ucrania",
  "Estados Unidos",
  "China",
  "Unión Europea",
  "Oriente Medio",
  "África subsahariana",
  "Indo-Pacífico",
]

const MOCK_COMMENT_SNIPPETS = [
  "Análisis muy completo sobre el contexto regional.",
  "Falta profundizar en las implicaciones económicas a corto plazo.",
  "Excelente síntesis de las posiciones de los actores principales.",
]

const favoriteState = new Map<number, boolean>()

const hashFromId = (id: number) => {
  let hash = id
  hash = (hash * 9301 + 49297) % 233280
  return hash
}

const pickMany = <T>(items: T[], id: number, count: number) => {
  const start = hashFromId(id) % items.length
  const picked: T[] = []
  for (let i = 0; i < count; i += 1) {
    picked.push(items[(start + i) % items.length])
  }
  return [...new Set(picked)]
}

const buildMockComments = (articleId: number): ArticleComment[] => {
  const count = (hashFromId(articleId) % 3) + 1
  const baseDate = new Date("2025-03-15T10:00:00Z")

  return Array.from({ length: count }, (_, index) => {
    const dayOffset = index * 4
    const commentDate = new Date(baseDate)
    commentDate.setDate(commentDate.getDate() - dayOffset)

    return {
      id: articleId * 10 + index,
      content: MOCK_COMMENT_SNIPPETS[index % MOCK_COMMENT_SNIPPETS.length],
      author_name: index % 2 === 0 ? "Ana Ruiz" : "Carlos Méndez",
      created_at: commentDate.toISOString(),
    }
  })
}

export const buildArticleDetailMock = (node: AppNode): ArticleDetail => {
  const articleId = Number(node.id)
  const seed = Number.isFinite(articleId) ? articleId : 1
  const ratingBase = 2.8 + (hashFromId(seed) % 23) / 10

  const authors = node.data.author_name
    ? node.data.author_name.split(",").map((name) => name.trim())
    : ["Redacción EOM"]

  return {
    id: seed,
    title: node.data.title ?? null,
    url: node.data.url ?? "#",
    excerpt: node.data.excerpt ?? null,
    image_url: node.data.imageUrl ?? null,
    date: "2025-02-12T08:00:00Z",
    paywalled: false,
    authors,
    categories: pickMany(MOCK_CATEGORIES, seed, 2),
    places: pickMany(MOCK_PLACES, seed + 7, 2),
    comments: buildMockComments(seed),
    average_rating: Math.round(ratingBase * 10) / 10,
    ratings_count: 12 + (hashFromId(seed + 3) % 40),
    user_rating: null,
    is_favorited: favoriteState.get(seed) ?? false,
  }
}

export const fetchArticleDetailMock = async (
  node: AppNode,
): Promise<ArticleDetail> => {
  await new Promise((resolve) => setTimeout(resolve, 280))
  return buildArticleDetailMock(node)
}

export const toggleFavoriteMock = async (
  articleId: number,
): Promise<{ is_favorited: boolean }> => {
  await new Promise((resolve) => setTimeout(resolve, 120))
  const next = !favoriteState.get(articleId)
  favoriteState.set(articleId, next)
  return { is_favorited: next }
}
