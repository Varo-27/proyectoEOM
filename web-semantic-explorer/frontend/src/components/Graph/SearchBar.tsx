import { Search } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
    onSearch: (query: string) => void
    isLoading?: boolean
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
    const [query, setQuery] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            onSearch(query.trim())
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-xl px-4"
        >
            <div className="relative flex items-center w-full shadow-lg rounded-lg overflow-hidden bg-background border">
                <Search className="absolute left-3 w-5 h-5 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar artículos por temática, autor, lugar..."
                    className="w-full pl-10 pr-20 h-12 border-0 focus-visible:ring-0 text-base"
                />
                <Button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="absolute right-1 h-9"
                >
                    {isLoading ? "Buscando..." : "Explorar"}
                </Button>
            </div>
        </form>
    )
}
