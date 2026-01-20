"use client"

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

// CSV Export
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
): void {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  const headers = columns 
    ? columns.map(col => col.header)
    : Object.keys(data[0])
  
  const keys = columns 
    ? columns.map(col => col.key)
    : Object.keys(data[0]) as (keyof T)[]

  const csvRows: string[] = []
  
  // Add headers
  csvRows.push(headers.join(','))

  // Add data rows
  for (const row of data) {
    const values = keys.map(key => {
      const value = row[key]
      // Handle different types
      if (value === null || value === undefined) return ''
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = value.replace(/"/g, '""')
        return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')
          ? `"${escaped}"`
          : escaped
      }
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return `"${value.join(', ')}"`
        }
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      return String(value)
    })
    csvRows.push(values.join(','))
  }

  const csvContent = csvRows.join('\n')
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export Button Component
interface ExportButtonProps<T extends Record<string, any>> {
  data: T[]
  filename: string
  columns?: { key: keyof T; header: string }[]
  sheetName?: string
}

export function ExportButtons<T extends Record<string, any>>({
  data,
  filename,
  columns,
}: ExportButtonProps<T>) {
  const [exporting, setExporting] = useState(false)

  const handleCSVExport = () => {
    setExporting(true)
    try {
      exportToCSV(data, filename, columns)
    } finally {
      setTimeout(() => setExporting(false), 500)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCSVExport}
      disabled={exporting || data.length === 0}
      className="border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300"
    >
      {exporting ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="ml-2 hidden sm:inline">Export CSV</span>
    </Button>
  )
}
