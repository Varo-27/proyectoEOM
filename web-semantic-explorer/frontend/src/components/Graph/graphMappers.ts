import type { Edge } from "@xyflow/react"

import type { ArticleSearchResult, GraphNode } from "@/client"
import type { AppNode, AppNodeData } from "@/store/useGraphStore"

import {
    DEFAULT_ARTICLE_TITLE,
    getStaggerDelay,
    GRAPH_SEARCH_RADIAL,
    SEARCH_ROOT_ID,
} from "./graphConstants"

export function articleToNodeData(
    article: ArticleSearchResult,
    appearDelay: number,
): AppNodeData {
    return {
        title: article.title || DEFAULT_ARTICLE_TITLE,
        excerpt: article.excerpt || undefined,
        url: article.url,
        imageUrl: article.image_url || undefined,
        author_name: article.authors?.length
            ? article.authors.join(", ")
            : undefined,
        appearDelay,
    }
}

export function graphNodeToAppNode(
    graphNode: GraphNode,
    position: { x: number; y: number },
    appearDelay: number,
): AppNode {
    return {
        id: graphNode.id,
        type: "article",
        position,
        data: articleToNodeData(graphNode.data, appearDelay),
    }
}

export function createSearchRootNode(query: string): AppNode {
    const { centerOffsetX, centerOffsetY } = GRAPH_SEARCH_RADIAL

    return {
        id: SEARCH_ROOT_ID,
        type: "searchCenter",
        position: {
            x: window.innerWidth / 2 - centerOffsetX,
            y: window.innerHeight / 2 - centerOffsetY,
        },
        data: {
            title: `Búsqueda: ${query}`,
            appearDelay: 0,
        },
    }
}

export function createSearchResultNodes(
    results: ArticleSearchResult[],
): AppNode[] {
    const { radius, spread, baseAngle, articleOffsetX, articleOffsetY } =
        GRAPH_SEARCH_RADIAL
    const total = results.length
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    return results.map((article, index) => {
        const t = total > 1 ? index / (total - 1) : 0.5
        const jitter = (Math.random() - 0.5) * 0.3
        const angle = baseAngle - spread / 2 + t * spread + jitter

        return {
            id: String(article.id),
            type: "article",
            position: {
                x: centerX + radius * Math.cos(angle) - articleOffsetX,
                y: centerY + radius * Math.sin(angle) - articleOffsetY,
            },
            data: articleToNodeData(
                article,
                getStaggerDelay(index, 160, 90),
            ),
        }
    })
}

export function createSearchEdges(results: ArticleSearchResult[]): Edge[] {
    return results.map((article) => ({
        id: `edge-root-${article.id}`,
        source: SEARCH_ROOT_ID,
        target: String(article.id),
    }))
}

export function dedupeEdgesById(edges: Edge[]): Edge[] {
    return edges.filter(
        (edge, index, self) =>
            self.findIndex((candidate) => candidate.id === edge.id) === index,
    )
}
