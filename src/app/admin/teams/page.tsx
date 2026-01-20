"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
import { PageHeader, LoadingSpinner, Pagination, usePagination, ExportButtons } from '@/components/admin'
import { TeamsTable } from '@/components/admin/teams-table'
import { TeamFormSheet } from '@/components/admin/team-form-sheet'
import { SearchWithFilters } from '@/components/admin/filter-tabs'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Team {
  id: string
  team_name: string
  college_name: string
  captain_name: string
  captain_email: string
  has_paid: boolean
  total_amount_payable: number
  payment_status: string
  created_at: string
  events: {
    id: string
    name: string
    slug: string
  }
}

interface Event {
  id: string
  name: string
  slug: string
  entry_fee: number
}

interface TeamMemberInput {
  name: string
  email: string
  phone: string
}

const initialFormState = {
  event_id: '',
  team_name: '',
  college_name: '',
  captain_name: '',
  captain_email: '',
  captain_phone: '',
  payment_mode: 'cash' as 'cash' | 'online',
  has_paid: false,
  amount_paid: 0,
}

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' }
]

const exportColumns = [
  { key: 'team_name' as const, header: 'Team Name' },
  { key: 'event_name' as const, header: 'Event' },
  { key: 'college_name' as const, header: 'College' },
  { key: 'captain_name' as const, header: 'Captain Name' },
  { key: 'captain_email' as const, header: 'Captain Email' },
  { key: 'payment_status' as const, header: 'Payment Status' },
  { key: 'total_amount_payable' as const, header: 'Amount' },
  { key: 'created_at' as const, header: 'Registration Date' },
]

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormState)
  const [members, setMembers] = useState<TeamMemberInput[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const pagination = usePagination(10)

  // Fetch teams
  const fetchTeams = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      
      let url = '/api/admin/teams'
      if (filter !== 'all') {
        url += `?has_paid=${filter === 'paid'}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filter])

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }, [])

  useEffect(() => {
    fetchTeams()
    fetchEvents()
  }, [fetchTeams, fetchEvents])

  // Open create modal
  function openCreateModal() {
    setFormData(initialFormState)
    setMembers([])
    setSubmitStatus('idle')
    setSubmitMessage('')
    setIsModalOpen(true)
  }

  // Handle form change
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Auto-fill amount when event is selected
    if (name === 'event_id' && value) {
      const selectedEvent = events.find(e => e.id === value)
      if (selectedEvent) {
        setFormData(prev => ({
          ...prev,
          event_id: value,
          amount_paid: selectedEvent.entry_fee || 0
        }))
      }
    }
  }

  // Member management
  function addMember() {
    setMembers([...members, { name: '', email: '', phone: '' }])
  }

  function removeMember(index: number) {
    setMembers(members.filter((_, i) => i !== index))
  }

  function updateMember(index: number, field: keyof TeamMemberInput, value: string) {
    const updated = [...members]
    updated[index][field] = value
    setMembers(updated)
  }

  // Submit form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          members: members.filter(m => m.name && m.email && m.phone)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add team')
      }

      setSubmitStatus('success')
      setSubmitMessage('Team added successfully!')
      
      // Refresh teams list
      fetchTeams()
      
      // Close modal after delay
      setTimeout(() => {
        setIsModalOpen(false)
        setFormData(initialFormState)
        setMembers([])
      }, 1500)

    } catch (err: unknown) {
      setSubmitStatus('error')
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setSubmitMessage(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Filter teams by search
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = search === '' || 
        team.team_name.toLowerCase().includes(search.toLowerCase()) ||
        team.captain_name.toLowerCase().includes(search.toLowerCase()) ||
        team.captain_email.toLowerCase().includes(search.toLowerCase()) ||
        team.college_name?.toLowerCase().includes(search.toLowerCase())
      return matchesSearch
    })
  }, [teams, search])

  // Reset pagination when search changes
  useEffect(() => {
    pagination.resetPagination()
  }, [search, filter])

  // Paginate
  const paginatedTeams = pagination.paginateData(filteredTeams)
  const totalPages = pagination.getTotalPages(filteredTeams.length)

  // Export data
  const exportData = useMemo(() => {
    return filteredTeams.map(t => ({
      team_name: t.team_name,
      event_name: t.events?.name || '',
      college_name: t.college_name || '',
      captain_name: t.captain_name,
      captain_email: t.captain_email,
      payment_status: t.has_paid ? 'Paid' : 'Unpaid',
      total_amount_payable: t.total_amount_payable || 0,
      created_at: new Date(t.created_at).toLocaleDateString()
    }))
  }, [filteredTeams])

  if (loading) {
    return <LoadingSpinner message="Loading teams..." />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Teams"
        description={`View and manage team registrations (${filteredTeams.length} total)`}
        backHref="/admin"
        action={{
          label: "Add Team",
          onClick: openCreateModal
        }}
        actions={
          <div className="flex items-center gap-3">
            <ExportButtons
              data={exportData}
              filename={`teams-${new Date().toISOString().split('T')[0]}`}
              columns={exportColumns}
              sheetName="Teams"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTeams(true)}
              disabled={refreshing}
              className="border-zinc-700 bg-transparent hover:bg-zinc-800"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />

      <SearchWithFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search teams..."
        filterOptions={filterOptions}
        filterValue={filter}
        onFilterChange={setFilter}
      />

      <TeamFormSheet
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        events={events}
        formData={formData}
        onFormChange={handleChange}
        members={members}
        onAddMember={addMember}
        onRemoveMember={removeMember}
        onUpdateMember={updateMember}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitStatus={submitStatus}
        submitMessage={submitMessage}
      />

      <TeamsTable teams={paginatedTeams} />

      {/* Pagination */}
      {filteredTeams.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={totalPages}
          totalItems={filteredTeams.length}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.setCurrentPage}
          onItemsPerPageChange={pagination.setItemsPerPage}
        />
      )}
    </div>
  )
}
