import { memo } from "react"

import type { FilterNodeKind } from "@/entities/graph"
import { FILTER_LABELS } from "@/shared/lib/filters"
import { Input } from "@/shared/ui/input"

import { AuthorFilterCombobox } from "./AuthorFilterCombobox"
import { CategoryFilterCombobox } from "./CategoryFilterCombobox"

type FilterValueFieldProps = {
  filterKey: FilterNodeKind
  value: string
  disabled?: boolean
  onCommit: (value: string) => void
}

function FilterValueFieldComponent({
  filterKey,
  value,
  disabled = false,
  onCommit,
}: FilterValueFieldProps) {
  if (filterKey === "author") {
    return (
      <AuthorFilterCombobox
        value={value}
        onCommit={onCommit}
        disabled={disabled}
        placeholder={FILTER_LABELS.author}
      />
    )
  }

  if (filterKey === "category") {
    return (
      <CategoryFilterCombobox
        value={value}
        onCommit={onCommit}
        disabled={disabled}
        placeholder={FILTER_LABELS.category}
      />
    )
  }

  const isYear = filterKey === "year_start" || filterKey === "year_end"
  const label = FILTER_LABELS[filterKey as keyof typeof FILTER_LABELS]

  return (
    <Input
      value={value}
      onChange={(event) => onCommit(event.target.value)}
      placeholder={label}
      type={isYear ? "number" : "text"}
      className="graph-node__filter-input nodrag nopan min-w-0 flex-1"
      disabled={disabled}
      readOnly={disabled}
      onMouseDown={(event) => event.stopPropagation()}
    />
  )
}

export const FilterValueField = memo(FilterValueFieldComponent)
