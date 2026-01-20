"use client"

import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface StatusBadgeProps {
  status: string
  type?: StatusType
  showIcon?: boolean
}

const statusConfig: Record<string, { type: StatusType; label?: string }> = {
  // Payment statuses
  paid: { type: 'success' },
  pending: { type: 'warning' },
  failed: { type: 'error' },
  // Visibility statuses
  public: { type: 'success' },
  draft: { type: 'warning' },
  hidden: { type: 'neutral' },
  archived: { type: 'neutral' },
  // Boolean statuses
  open: { type: 'success' },
  closed: { type: 'error' },
  // Generic
  active: { type: 'success' },
  inactive: { type: 'neutral' },
}

const typeStyles: Record<StatusType, string> = {
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  neutral: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20',
}

const typeIcons: Record<StatusType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  warning: Clock,
  error: XCircle,
  info: AlertCircle,
  neutral: Clock,
}

export function StatusBadge({ status, type, showIcon = true }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase()
  const config = statusConfig[normalizedStatus]
  const resolvedType = type || config?.type || 'neutral'
  const Icon = typeIcons[resolvedType]
  const styles = typeStyles[resolvedType]
  const displayLabel = config?.label || status

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${styles}`}>
      {showIcon && <Icon className="w-3 h-3 sm:w-4 sm:h-4" />}
      <span className="capitalize">{displayLabel}</span>
    </span>
  )
}

interface BooleanBadgeProps {
  value: boolean
  trueLabel?: string
  falseLabel?: string
}

export function BooleanBadge({ value, trueLabel = 'Yes', falseLabel = 'No' }: BooleanBadgeProps) {
  return (
    <StatusBadge 
      status={value ? trueLabel : falseLabel} 
      type={value ? 'success' : 'error'} 
    />
  )
}
