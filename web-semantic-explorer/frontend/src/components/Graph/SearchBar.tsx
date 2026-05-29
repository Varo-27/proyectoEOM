import { Search, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SearchBarProps = {
  onSearch: (query: string) => void
  isLoading?: boolean
  initialQuery?: string
  placeFilter?: string
  onClearPlace?: () => void
}

export function SearchBar({
  onSearch,
  isLoading,
  initialQuery = "",
  placeFilter,
  onClearPlace,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <div className="absolute top-6 left-1/2 z-10 w-full max-w-xl -translate-x-1/2 px-4">
      {placeFilter && (
        <div className="mb-2 flex justify-center">
          <Badge
            variant="outline"
            className="gap-2 rounded-none border-foreground px-3 py-1 text-[10px] uppercase tracking-widest"
          >
            Lugar: {placeFilter}
            {onClearPlace && (
              <button
                type="button"
                onClick={onClearPlace}
                className="inline-flex items-center hover:text-foreground"
                aria-label="Quitar filtro de lugar"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full items-center overflow-hidden border-2 border-foreground bg-background shadow-[4px_4px_0_0_var(--color-foreground)]"
      >
        <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar artículos por temática, autor, lugar..."
          className="h-12 w-full border-0 pr-20 pl-10 text-base focus-visible:ring-0"
        />
        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-1 h-9"
        >
          {isLoading ? "Buscando..." : "Explorar"}
        </Button>
      </form>
    </div>
  )
}
