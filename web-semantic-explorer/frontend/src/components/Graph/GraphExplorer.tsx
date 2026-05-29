import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    type NodeTypes,
    ReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { SearchService } from "@/client"
import { useGraphStore } from "@/store/useGraphStore"
import { ArticleNode } from "./nodes/ArticleNode"
import { SearchNode } from "./nodes/SearchNode"
import { SearchBar } from "./SearchBar"

// Corrección: tipar explícitamente el objeto nodeTypes
const nodeTypes: NodeTypes = {
    article: ArticleNode,
    searchCenter: SearchNode,
}

export default function GraphExplorer() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setNodes,
        setEdges,
        isLoading,
        setLoading,
    } = useGraphStore()

    const _handleSearch = async (query: string) => {
        setLoading(true)
        try {
            const response = await SearchService.searchArticles({
                q: query,
                limit: 5,
            })

            const _centralNode = {
                id: "search-root",
                type: "searchCenter", // Asegúrate de que el tipo coincida con la clave en nodeTypes
                position: {
                    x: window.innerWidth / 2 - 140,
                    y: window.innerHeight / 2 - 40,
                },
                data: { title: `Búsqueda: ${query}` },
            }

            const _newNodes = response.results.map((article, i) => {
                const angle = (i / response.results.length) * 2 * Math.PI
                return {
                    id: String(article.id),
                    type: "article",
                    position: {
                        x: window.innerWidth / 2 + 350 * Math.cos(angle) - 160,
                        y: window.innerHeight / 2 + 350 * Math.sin(angle) - 60,
                    },
                    data: {
                        title: article.title || "Sin título",
                        excerpt: article.excerpt || undefined,
                        url: article.url,
                        imageUrl: article.image_url || undefined,
                        author_name: article.authors?.length
                            ? article.authors.join(", ")
                            : undefined,
                    },
                }
            })

            setNodes([_centralNode, ..._newNodes])
            setEdges(
                response.results.map((article) => ({
                    id: `edge-root-${article.id}`,
                    source: "search-root",
                    target: String(article.id),
                })),
            )
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative w-full h-full bg-muted/20">
            <SearchBar onSearch={_handleSearch} isLoading={isLoading} />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    )
}
