import { useQuery } from "@tanstack/react-query"
import { Check, Loader2 } from "lucide-react"
import { memo, useEffect, useMemo, useRef, useState } from "react"

import { listAuthors } from "@/api/taxonomy"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type AuthorFilterComboboxProps = {
  value: string
  onCommit: (value: string) => void
  placeholder?: string
}

function AuthorFilterComboboxComponent({
  value,
  onCommit,
  placeholder = "Buscar autor…",
}: AuthorFilterComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["taxonomy", "authors"],
    queryFn: () => listAuthors(),
    staleTime: 1000 * 60 * 10,
  })

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  const filteredAuthors = useMemo(() => {
    const authors = data?.authors ?? []
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return authors.slice(0, 40)
    }

    return authors
      .filter((author) => author.name.toLowerCase().includes(needle))
      .slice(0, 40)
  }, [data?.authors, query])

  const pickAuthor = (name: string) => {
    setQuery(name)
    onCommit(name)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="graph-node__filter-input nodrag nopan"
        onMouseDown={(event) => event.stopPropagation()}
        autoComplete="off"
      />

      {open && (
        <ul
          className="graph-node__author-menu nodrag nopan"
          onMouseDown={(event) => event.stopPropagation()}
        >
          {isLoading && (
            <li className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Cargando autores…
            </li>
          )}

          {!isLoading && filteredAuthors.length === 0 && (
            <li className="px-2 py-2 text-xs text-muted-foreground">
              Sin coincidencias
            </li>
          )}

          {filteredAuthors.map((author) => {
            const selected = author.name === value
            return (
              <li key={author.name}>
                <button
                  type="button"
                  className={cn(
                    "graph-node__author-option",
                    selected && "graph-node__author-option--selected",
                  )}
                  onClick={() => pickAuthor(author.name)}
                >
                  <Check
                    className={cn(
                      "h-3 w-3 shrink-0 text-primary",
                      !selected && "opacity-0",
                    )}
                  />
                  <span className="truncate">{author.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export const AuthorFilterCombobox = memo(AuthorFilterComboboxComponent)
