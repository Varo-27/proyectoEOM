import { memo } from "react"

import { useAuthorsTaxonomy } from "@/shared/lib/useTaxonomyQuery"

import { TaxonomyFilterCombobox } from "./TaxonomyFilterCombobox"

type AuthorFilterComboboxProps = {
  value: string
  onCommit: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

function AuthorFilterComboboxComponent({
  value,
  onCommit,
  placeholder = "Buscar autor…",
  disabled = false,
}: AuthorFilterComboboxProps) {
  const { data, isLoading } = useAuthorsTaxonomy()

  return (
    <TaxonomyFilterCombobox
      value={value}
      onCommit={onCommit}
      options={data?.authors ?? []}
      isLoading={isLoading}
      placeholder={placeholder}
      loadingLabel="Cargando autores…"
      disabled={disabled}
    />
  )
}

export const AuthorFilterCombobox = memo(AuthorFilterComboboxComponent)
