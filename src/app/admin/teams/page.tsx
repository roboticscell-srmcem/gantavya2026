"use client"

import { useEffect, useState } from 'react'
import { Search, Plus, ArrowLeft, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'

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

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormState)
  const [members, setMembers] = useState<TeamMemberInput[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    fetchTeams()
    fetchEvents()
  }, [filter])

  async function fetchTeams() {
    try {
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
    }
  }

  async function fetchEvents() {
    try {
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  function openCreateModal() {
    setFormData(initialFormState)
    setMembers([])
    setSubmitStatus('idle')
    setSubmitMessage('')
    setIsModalOpen(true)
  }

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

    } catch (err: any) {
      setSubmitStatus('error')
      setSubmitMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTeams = teams.filter(team => {
    const matchesSearch = search === '' || 
      team.team_name.toLowerCase().includes(search.toLowerCase()) ||
      team.captain_name.toLowerCase().includes(search.toLowerCase()) ||
      team.captain_email.toLowerCase().includes(search.toLowerCase()) ||
      team.college_name?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Teams</h1>
            <p className="text-neutral-400">View and manage team registrations</p>
          </div>
        </div>
        <Button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Team Manually
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-neutral-900 border-neutral-800"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' 
                ? 'bg-orange-600 text-white' 
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'paid' 
                ? 'bg-orange-600 text-white' 
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'unpaid' 
                ? 'bg-orange-600 text-white' 
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            Unpaid
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Team Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                College
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Captain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-neutral-400">
                  No teams found
                </td>
              </tr>
            ) : (
              filteredTeams.map((team) => (
                <tr key={team.id} className="hover:bg-neutral-800/50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    <Link href={`/admin/teams/${team.id}`}>
                      {team.team_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    {team.events?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    {team.college_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    <div>{team.captain_name}</div>
                    <div className="text-xs text-neutral-500">{team.captain_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    ₹{team.total_amount_payable}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      team.has_paid 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {team.has_paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Team Modal */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent side="right" className="bg-neutral-900 border-neutral-800 text-white w-full sm:w-[500px] lg:w-[600px] p-0 flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-neutral-800 flex-shrink-0">
            <SheetTitle className="text-xl text-white">Add Team Manually</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-300">Success!</h3>
                      <p className="text-sm text-green-200">{submitMessage}</p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-300">Error</h3>
                      <p className="text-sm text-red-200">{submitMessage}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Event Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="event_id" className="text-white">Event *</Label>
                    <select
                      id="event_id"
                      name="event_id"
                      value={formData.event_id}
                      onChange={handleChange}
                      className="w-full h-10 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-white"
                      required
                    >
                      <option value="">Select an event</option>
                      {events.map(event => (
                        <option key={event.id} value={event.id}>
                          {event.name} (₹{event.entry_fee || 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Team Name */}
                  <div className="space-y-2">
                    <Label htmlFor="team_name" className="text-white">Team Name *</Label>
                    <Input
                      id="team_name"
                      name="team_name"
                      value={formData.team_name}
                      onChange={handleChange}
                      placeholder="Enter team name"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>

                  {/* College Name */}
                  <div className="space-y-2">
                    <Label htmlFor="college_name" className="text-white">College/Institution *</Label>
                    <Input
                      id="college_name"
                      name="college_name"
                      value={formData.college_name}
                      onChange={handleChange}
                      placeholder="Enter college name"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>

                  {/* Captain Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-neutral-800 pb-2">
                      Captain Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="captain_name" className="text-white">Full Name *</Label>
                        <Input
                          id="captain_name"
                          name="captain_name"
                          value={formData.captain_name}
                          onChange={handleChange}
                          placeholder="Captain's full name"
                          className="bg-neutral-800 border-neutral-700 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="captain_email" className="text-white">Email *</Label>
                        <Input
                          id="captain_email"
                          name="captain_email"
                          type="email"
                          value={formData.captain_email}
                          onChange={handleChange}
                          placeholder="captain@example.com"
                          className="bg-neutral-800 border-neutral-700 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="captain_phone" className="text-white">Phone *</Label>
                        <Input
                          id="captain_phone"
                          name="captain_phone"
                          value={formData.captain_phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className="bg-neutral-800 border-neutral-700 text-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Team Members (Optional)</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addMember}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Member
                      </Button>
                    </div>
                    
                    {members.map((member, index) => (
                      <div key={index} className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-400">Member {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeMember(index)}
                            className="p-1 hover:bg-neutral-700 rounded"
                          >
                            <X className="w-4 h-4 text-neutral-400" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <Input
                            placeholder="Name"
                            value={member.name}
                            onChange={(e) => updateMember(index, 'name', e.target.value)}
                            className="bg-neutral-800 border-neutral-700 text-white"
                          />
                          <Input
                            placeholder="Email"
                            type="email"
                            value={member.email}
                            onChange={(e) => updateMember(index, 'email', e.target.value)}
                            className="bg-neutral-800 border-neutral-700 text-white"
                          />
                          <Input
                            placeholder="Phone"
                            value={member.phone}
                            onChange={(e) => updateMember(index, 'phone', e.target.value)}
                            className="bg-neutral-800 border-neutral-700 text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-neutral-800 pb-2">
                      Payment Details
                    </h3>
                    
                    <div className="space-y-2">
                      <Label className="text-white">Payment Mode *</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="payment_mode"
                            value="cash"
                            checked={formData.payment_mode === 'cash'}
                            onChange={handleChange}
                            className="accent-orange-600"
                          />
                          <span className="text-white">Cash</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="payment_mode"
                            value="online"
                            checked={formData.payment_mode === 'online'}
                            onChange={handleChange}
                            className="accent-orange-600"
                          />
                          <span className="text-white">Online (Manual Entry)</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount_paid" className="text-white">Amount (₹)</Label>
                      <Input
                        id="amount_paid"
                        name="amount_paid"
                        type="number"
                        value={formData.amount_paid}
                        onChange={handleChange}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="has_paid"
                        name="has_paid"
                        checked={formData.has_paid}
                        onChange={handleChange}
                        className="accent-orange-600 w-4 h-4"
                      />
                      <Label htmlFor="has_paid" className="text-white cursor-pointer">
                        Mark as Paid
                      </Label>
                    </div>
                  </div>
                </form>
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-neutral-800 p-6">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Team'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
