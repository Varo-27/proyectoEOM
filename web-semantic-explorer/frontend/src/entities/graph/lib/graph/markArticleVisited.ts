import type { AppNode } from "@/entities/graph/model/types"

/** Marca un artículo como visitado (persistido en el workspace). */
export function markArticleVisited(nodes: AppNode[], articleId: string): AppNode[] {
  const visitedAt = new Date().toISOString()

  return nodes.map((node) => {
    if (node.id !== articleId || node.type !== "article") {
      return node
    }

    if (node.data.visitedAt === visitedAt) {
      return node
    }

    return {
      ...node,
      data: {
        ...node.data,
        visitedAt,
      },
    }
  })
}

export function isArticleVisited(node: AppNode): boolean {
  return node.type === "article" && typeof node.data.visitedAt === "string"
}
