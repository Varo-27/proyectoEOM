import { Search } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SearchBarProps = {
  onSearch: (query: string) => void
  isLoading?: boolean
  initialQuery?: string
}

export function SearchBar({
  onSearch,
  isLoading,
  initialQuery = "",
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
