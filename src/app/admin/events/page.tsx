"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
import { PageHeader, LoadingSpinner, Pagination, usePagination, ExportButtons, SearchWithFilters } from '@/components/admin'
import { EventFormSheet } from '@/components/admin/event-form-sheet'
import { EventsTable } from '@/components/admin/events-table'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Event {
  id: string
  slug: string
  name: string
  brief: string
  description: string
  min_team_size: number
  max_team_size: number
  visibility: string
  registration_open: boolean
  start_time: string | null
  venue: string
  prize_amount: number
  entry_fee: number
  rulebook_url: string | null
  banner_url: string | null
  content: string | null
  created_at: string
}

interface EventRule {
  id?: string
  rule_text: string
}

const initialFormState = {
  name: '',
  slug: '',
  brief: '',
  description: '',
  min_team_size: 1,
  max_team_size: 4,
  prize_amount: 0,
  entry_fee: 0,
  venue: '',
  visibility: 'draft',
  registration_open: false,
  start_time: null as Date | null,
  rulebook_url: '',
  banner_url: '',
  content: '',
}

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public' },
  { id: 'draft', label: 'Draft' },
  { id: 'hidden', label: 'Hidden' },
]

const exportColumns = [
  { key: 'name' as const, header: 'Event Name' },
  { key: 'slug' as const, header: 'Slug' },
  { key: 'visibility' as const, header: 'Visibility' },
  { key: 'registration_open' as const, header: 'Registration Open' },
  { key: 'entry_fee' as const, header: 'Entry Fee' },
  { key: 'prize_amount' as const, header: 'Prize Amount' },
  { key: 'venue' as const, header: 'Venue' },
  { key: 'min_team_size' as const, header: 'Min Team Size' },
  { key: 'max_team_size' as const, header: 'Max Team Size' },
  { key: 'start_time' as const, header: 'Start Time' },
]

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormState)
  const [rules, setRules] = useState<EventRule[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const pagination = usePagination(10)

  // Fetch events
  const fetchEvents = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Reset pagination when filter/search changes
  useEffect(() => {
    pagination.resetPagination()
  }, [filter, search])

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesFilter = filter === 'all' || event.visibility === filter
      const matchesSearch = search === '' ||
        event.name.toLowerCase().includes(search.toLowerCase()) ||
        event.slug.toLowerCase().includes(search.toLowerCase()) ||
        event.venue?.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [events, filter, search])

  // Paginate
  const paginatedEvents = pagination.paginateData(filteredEvents)
  const totalPages = pagination.getTotalPages(filteredEvents.length)

  // Export data
  const exportData = useMemo(() => {
    return filteredEvents.map(e => ({
      name: e.name,
      slug: e.slug,
      visibility: e.visibility,
      registration_open: e.registration_open ? 'Yes' : 'No',
      entry_fee: e.entry_fee,
      prize_amount: e.prize_amount,
      venue: e.venue || '',
      min_team_size: e.min_team_size,
      max_team_size: e.max_team_size,
      start_time: e.start_time ? new Date(e.start_time).toLocaleString() : ''
    }))
  }, [filteredEvents])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Delete event
  async function deleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEvents(events.filter(e => e.id !== id))
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  // Open create modal
  function openCreateModal() {
    setFormData(initialFormState)
    setRules([])
    setIsEditing(false)
    setEditingId(null)
    setError('')
    setIsModalOpen(true)
  }

  // Open edit modal
  async function openEditModal(event: Event) {
    setFormData({
      name: event.name,
      slug: event.slug,
      brief: event.brief || '',
      description: event.description || '',
      min_team_size: event.min_team_size,
      max_team_size: event.max_team_size,
      prize_amount: event.prize_amount,
      entry_fee: event.entry_fee || 0,
      venue: event.venue || '',
      visibility: event.visibility,
      registration_open: event.registration_open,
      start_time: event.start_time ? new Date(event.start_time) : null,
      rulebook_url: event.rulebook_url || '',
      banner_url: event.banner_url || '',
      content: event.content || '',
    })
    
    // Fetch rules for this event
    try {
      const response = await fetch(`/api/admin/events/${event.id}/rules`)
      if (response.ok) {
        const data = await response.json()
        setRules(data.rules || [])
      }
    } catch (error) {
      console.error('Error fetching rules:', error)
      setRules([])
    }
    
    setIsEditing(true)
    setEditingId(event.id)
    setError('')
    setIsModalOpen(true)
  }

  // Submit form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const url = isEditing ? `/api/admin/events/${editingId}` : '/api/admin/events'
      const method = isEditing ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        start_time: formData.start_time?.toISOString() || null,
        rules: rules.map(r => r.rule_text),
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save event')
      }

      setIsModalOpen(false)
      fetchEvents()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle form change
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }))
  }

  // Handle date change
  function handleDateChange(date: Date | null) {
    setFormData(prev => ({ ...prev, start_time: date }))
  }

  // Add rule
  function addRule(ruleText: string) {
    setRules([...rules, { rule_text: ruleText }])
  }

  // Remove rule
  function removeRule(index: number) {
    setRules(rules.filter((_, i) => i !== index))
  }

  // File upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'rulebooks')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, rulebook_url: data.url }))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  // Banner upload
  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    setUploadingBanner(true)
    setError('')

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'banners')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, banner_url: data.url }))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload banner image'
      setError(errorMessage)
    } finally {
      setUploadingBanner(false)
    }
  }

  // Clear banner
  function clearBanner() {
    setFormData(prev => ({ ...prev, banner_url: '' }))
  }

  if (loading) {
    return <LoadingSpinner message="Loading events..." />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Events"
        description={`Manage your events (${filteredEvents.length} total)`}
        backHref="/admin"
        action={{
          label: "Create Event",
          onClick: openCreateModal
        }}
        actions={
          <div className="flex items-center gap-3">
            <ExportButtons
              data={exportData}
              filename={`events-${new Date().toISOString().split('T')[0]}`}
              columns={exportColumns}
              sheetName="Events"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEvents(true)}
              disabled={refreshing}
              className="border-zinc-700 bg-transparent hover:bg-zinc-800"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchWithFilters
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search events by name, slug, or venue..."
          filterOptions={filterOptions.map(f => ({ value: f.id, label: f.label }))}
          filterValue={filter}
          onFilterChange={setFilter}
        />
      </div>

      <EventFormSheet
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        isEditing={isEditing}
        formData={formData}
        onFormChange={handleChange}
        onDateChange={handleDateChange}
        rules={rules}
        onAddRule={addRule}
        onRemoveRule={removeRule}
        onSubmit={handleSubmit}
        onFileUpload={handleFileUpload}
        onBannerUpload={handleBannerUpload}
        onClearBanner={clearBanner}
        submitting={submitting}
        uploading={uploading}
        uploadingBanner={uploadingBanner}
        error={error}
      />

      <EventsTable
        events={paginatedEvents}
        onEdit={openEditModal}
        onDelete={deleteEvent}
      />

      {/* Pagination */}
      {filteredEvents.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={totalPages}
          totalItems={filteredEvents.length}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.setCurrentPage}
          onItemsPerPageChange={pagination.setItemsPerPage}
        />
      )}
    </div>
  )
}
