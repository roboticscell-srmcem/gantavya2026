"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface FormSheetProps {
  open?: boolean
  isOpen?: boolean // Alias for open
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  submitLabel?: string
  submitting?: boolean
  submitDisabled?: boolean
  isEdit?: boolean
  error?: string
  formId?: string
  width?: 'sm' | 'md' | 'lg'
}

export function FormSheet({
  open,
  isOpen,
  onOpenChange,
  title,
  children,
  onSubmit,
  submitLabel,
  submitting = false,
  submitDisabled = false,
  isEdit = false,
  error,
  formId = 'sheet-form',
  width = 'md'
}: FormSheetProps) {
  const defaultSubmitLabel = isEdit ? 'Update' : 'Create'
  const isSheetOpen = open ?? isOpen ?? false

  const widthClasses = {
    sm: 'w-full sm:w-[400px]',
    md: 'w-full sm:w-[500px] md:w-[600px]',
    lg: 'w-full sm:w-[500px] md:w-[600px] lg:w-[800px]'
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className={`bg-neutral-900 border-neutral-800 text-white ${widthClasses[width]} p-0 flex flex-col h-full`}
      >
        <SheetHeader className="p-4 sm:p-6 border-b border-neutral-800 shrink-0">
          <SheetTitle className="text-lg sm:text-xl text-white">{title}</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 sm:p-6">
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} id={formId}>
                {children}
              </form>
            </div>
          </ScrollArea>
        </div>

        <div className="shrink-0 p-4 sm:p-6 border-t border-neutral-800 bg-neutral-900">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-neutral-700 text-white hover:bg-neutral-800 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={submitting || submitDisabled}
              className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
            >
              {submitting ? 'Saving...' : submitLabel || defaultSubmitLabel}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
