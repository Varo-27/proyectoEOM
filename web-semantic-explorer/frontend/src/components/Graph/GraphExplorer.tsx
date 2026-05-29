import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    ReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { SearchService } from "@/client"
import { useGraphStore } from "@/store/useGraphStore"
import { SearchBar } from "./SearchBar"

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

    const handleSearch = async (query: string) => {
        setLoading(true)

        try {
            const response = await SearchService.searchArticles({
                q: query,
                limit: 5,
            })

            // The search root node
            const centralNode = {
                id: "search-root",
                position: {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                },
                data: {
                    title: `Búsqueda: ${query}`,
                    excerpt: "Resultados base extraídos semánticamente",
                },
                type: "default",
            }

            // We'll place the new results simply in a radial layout for now
            const radius = 250
            const newNodes = response.results.map((article, i) => {
                const angle = (i / response.results.length) * 2 * Math.PI
                return {
                    id: String(article.id),
                    position: {
                        x: window.innerWidth / 2 + radius * Math.cos(angle),
                        y: window.innerHeight / 2 + radius * Math.sin(angle),
                    },
                    data: {
                        title: article.title || "Sin título",
                        excerpt: article.excerpt || undefined,
                        url: article.url,
                        imageUrl: article.image_url || undefined,
                        label: article.title || "Sin título",
                    },
                    type: "default",
                }
            })

            // Connect root to the results
            const newEdges = response.results.map((article) => ({
                id: `edge-root-${article.id}`,
                source: "search-root",
                target: String(article.id),
            }))

            setNodes([centralNode, ...newNodes])
            setEdges(newEdges)
        } catch (error) {
            console.error("Error during search:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative w-full h-full bg-muted/20">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />

            <ReactFlow
                nodes={nodes}
                edges={edges}
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
