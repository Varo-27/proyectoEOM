import { memo } from "react"

import { useCategoriesTaxonomy } from "@/shared/lib/useTaxonomyQuery"

import { TaxonomyFilterCombobox } from "./TaxonomyFilterCombobox"

type CategoryFilterComboboxProps = {
  value: string
  onCommit: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

function CategoryFilterComboboxComponent({
  value,
  onCommit,
  placeholder = "Buscar categoría…",
  disabled = false,
}: CategoryFilterComboboxProps) {
  const { data, isLoading } = useCategoriesTaxonomy()

  return (
    <TaxonomyFilterCombobox
      value={value}
      onCommit={onCommit}
      options={data?.categories ?? []}
      isLoading={isLoading}
      placeholder={placeholder}
      loadingLabel="Cargando categorías…"
      disabled={disabled}
    />
  )
}

export const CategoryFilterCombobox = memo(CategoryFilterComboboxComponent)
