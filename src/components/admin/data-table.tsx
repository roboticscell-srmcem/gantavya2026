"use client"

import React from 'react'
import { Search } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  className?: string
  headerClassName?: string
  render?: (item: T) => React.ReactNode
  hideOnMobile?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  emptyMessage?: string
  isLoading?: boolean
  onRowClick?: (item: T) => void
}

export function DataTable<T>({ 
  columns, 
  data, 
  keyField, 
  emptyMessage = 'No data found',
  isLoading = false,
  onRowClick
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-neutral-800">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider ${col.headerClassName || ''} ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-neutral-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr 
                  key={String(item[keyField])} 
                  className={`hover:bg-neutral-800/50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key} 
                      className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${col.className || ''} ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                    >
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface SearchFilterProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  filters?: React.ReactNode
}

export function SearchFilter({ 
  search, 
  onSearchChange, 
  placeholder = 'Search...', 
  filters 
}: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 text-sm"
        />
      </div>
      {filters && (
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filters}
        </div>
      )}
    </div>
  )
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

export function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-orange-500 text-white'
          : 'bg-neutral-800 text-neutral-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
