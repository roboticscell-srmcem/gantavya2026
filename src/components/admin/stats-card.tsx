"use client"

import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  iconColor?: string
  bgColor?: string
  valueColor?: string
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-orange-500',
  bgColor = 'bg-orange-500/10',
  valueColor = 'text-white'
}: StatsCardProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-neutral-400 mb-1 truncate">{title}</p>
          <p className={`text-xl sm:text-2xl font-bold ${valueColor} truncate`}>{value}</p>
        </div>
        {Icon && (
          <div className={`${bgColor} ${iconColor} p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>
    </div>
  )
}

interface StatsGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4 | 5
}

export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
  const colsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  }

  return (
    <div className={`grid ${colsClass[columns]} gap-3 sm:gap-4 md:gap-6`}>
      {children}
    </div>
  )
}
