"use client"

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface FilterOption {
  value: string
  label: string
}

interface FilterTabsProps {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

export function FilterTabs({ options, value, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
            value === option.value
              ? 'bg-orange-600 text-white'
              : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

interface SearchWithFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filterOptions?: FilterOption[]
  filterValue?: string
  onFilterChange?: (value: string) => void
}

export function SearchWithFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterOptions,
  filterValue,
  onFilterChange
}: SearchWithFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-neutral-900 border-neutral-800 text-sm"
        />
      </div>
      {filterOptions && filterValue !== undefined && onFilterChange && (
        <FilterTabs
          options={filterOptions}
          value={filterValue}
          onChange={onFilterChange}
        />
      )}
    </div>
  )
}
