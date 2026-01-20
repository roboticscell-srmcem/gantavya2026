"use client"

import Link from 'next/link'
import { ArrowLeft, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  backLink?: string // Alternative name for backHref
  action?: {
    label: string
    icon?: LucideIcon
    onClick: () => void
  }
  actions?: ReactNode // Additional actions (export buttons, refresh, etc.)
}

export function PageHeader({ title, description, backHref, backLink, action, actions }: PageHeaderProps) {
  const back = backHref || backLink
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        {back && (
          <Link 
            href={back} 
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base text-neutral-400">{description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {actions}
        {action && (
          <Button 
            onClick={action.onClick} 
            className="bg-orange-600 hover:bg-orange-700 flex-1 sm:flex-none"
          >
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
