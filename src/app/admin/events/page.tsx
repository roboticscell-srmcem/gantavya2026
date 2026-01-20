"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, Edit, Trash2, Eye, X, CalendarIcon, Upload, FileText, ImageIcon, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'

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

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormState)
  const [rules, setRules] = useState<EventRule[]>([])
  const [newRule, setNewRule] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  const [uploading, setUploading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

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

  function openCreateModal() {
    setFormData(initialFormState)
    setRules([])
    setIsEditing(false)
    setEditingId(null)
    setError('')
    setActiveTab('basic')
    setIsModalOpen(true)
  }

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
    setActiveTab('basic')
    setIsModalOpen(true)
  }

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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }))
  }

  function addRule() {
    if (newRule.trim()) {
      setRules([...rules, { rule_text: newRule.trim() }])
      setNewRule('')
    }
  }

  function removeRule(index: number) {
    setRules(rules.filter((_, i) => i !== index))
  }

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
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP)')
      return
    }

    // Check file size (max 5MB)
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
    } catch (err: any) {
      setError(err.message || 'Failed to upload banner image')
    } finally {
      setUploadingBanner(false)
    }
  }

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
            <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
            <p className="text-neutral-400">Manage your events</p>
          </div>
        </div>
        <Button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Create/Edit Sheet */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent side="right" className="bg-neutral-900 border-neutral-800 text-white w-full sm:w-[600px] lg:w-[800px] p-0 flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-neutral-800 flex-shrink-0">
            <SheetTitle className="text-xl text-white">{isEditing ? 'Edit Event' : 'Create New Event'}</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} id="event-form">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-neutral-800">
                      <TabsTrigger value="basic" className="data-[state=active]:bg-orange-600">Basic Info</TabsTrigger>
                      <TabsTrigger value="details" className="data-[state=active]:bg-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="rules" className="data-[state=active]:bg-orange-600">Rules</TabsTrigger>
                    <TabsTrigger value="content" className="data-[state=active]:bg-orange-600">Content</TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Event Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Code Wars"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-white">Slug *</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="e.g., code-wars"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brief" className="text-white">Brief Description *</Label>
                  <Input
                    id="brief"
                    name="brief"
                    value={formData.brief}
                    onChange={handleChange}
                    placeholder="Short description for event cards"
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Full Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Detailed event description"
                    className="bg-neutral-800 border-neutral-700 text-white min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visibility" className="text-white">Visibility</Label>
                    <select
                      id="visibility"
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleChange}
                      className="w-full h-10 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="public">Public</option>
                      <option value="hidden">Hidden</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="space-y-2 flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="registration_open"
                        checked={formData.registration_open}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 accent-orange-600"
                      />
                      <span className="text-white">Registration Open</span>
                    </label>
                  </div>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_team_size" className="text-white">Min Team Size</Label>
                    <Input
                      id="min_team_size"
                      name="min_team_size"
                      type="number"
                      min="1"
                      value={formData.min_team_size}
                      onChange={handleChange}
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_team_size" className="text-white">Max Team Size</Label>
                    <Input
                      id="max_team_size"
                      name="max_team_size"
                      type="number"
                      min="1"
                      value={formData.max_team_size}
                      onChange={handleChange}
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entry_fee" className="text-white">Entry Fee (₹)</Label>
                    <Input
                      id="entry_fee"
                      name="entry_fee"
                      type="number"
                      min="0"
                      value={formData.entry_fee}
                      onChange={handleChange}
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prize_amount" className="text-white">Prize Amount (₹)</Label>
                    <Input
                      id="prize_amount"
                      name="prize_amount"
                      type="number"
                      min="0"
                      value={formData.prize_amount}
                      onChange={handleChange}
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue" className="text-white">Venue</Label>
                    <Input
                      id="venue"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      placeholder="e.g., Main Auditorium"
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Event Date & Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.start_time ? format(formData.start_time, "PPP p") : "Pick date & time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-neutral-800 border-neutral-700" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.start_time || undefined}
                          onSelect={(date) => setFormData(prev => ({ ...prev, start_time: date || null }))}
                          initialFocus
                          className="bg-neutral-800 text-white"
                        />
                        <div className="p-3 border-t border-neutral-700">
                          <Label className="text-white text-sm">Time</Label>
                          <Input
                            type="time"
                            value={formData.start_time ? format(formData.start_time, "HH:mm") : ""}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number)
                              const newDate = formData.start_time ? new Date(formData.start_time) : new Date()
                              newDate.setHours(hours, minutes)
                              setFormData(prev => ({ ...prev, start_time: newDate }))
                            }}
                            className="mt-1 bg-neutral-700 border-neutral-600 text-white"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Rulebook PDF</Label>
                  <div className="flex gap-2">
                    <Input
                      id="rulebook_url"
                      name="rulebook_url"
                      value={formData.rulebook_url}
                      onChange={handleChange}
                      placeholder="URL to rulebook PDF or upload below"
                      className="bg-neutral-800 border-neutral-700 text-white flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md cursor-pointer hover:bg-neutral-700 transition-colors">
                      <Upload className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-300">
                        {uploading ? 'Uploading...' : 'Upload PDF'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {formData.rulebook_url && (
                      <a
                        href={formData.rulebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-orange-500 hover:text-orange-400 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        View Current PDF
                      </a>
                    )}
                  </div>
                </div>

                {/* Banner Image Upload */}
                <div className="space-y-2">
                  <Label className="text-white">Event Banner Image</Label>
                  <p className="text-sm text-neutral-400 mb-2">Upload a banner image for the event page (PNG, JPG, WebP - max 5MB)</p>
                  <div className="flex gap-2">
                    <Input
                      id="banner_url"
                      name="banner_url"
                      value={formData.banner_url}
                      onChange={handleChange}
                      placeholder="URL to banner image or upload below"
                      className="bg-neutral-800 border-neutral-700 text-white flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md cursor-pointer hover:bg-neutral-700 transition-colors">
                      <ImageIcon className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-300">
                        {uploadingBanner ? 'Uploading...' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                        disabled={uploadingBanner}
                      />
                    </label>
                    {formData.banner_url && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))}
                        className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                  {formData.banner_url && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-neutral-700">
                      <img
                        src={formData.banner_url}
                        alt="Banner preview"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Rules Tab */}
              <TabsContent value="rules" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-white">Event Rules</Label>
                  <p className="text-sm text-neutral-400">Add rules for the event. These will be displayed on the event page.</p>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Enter a rule..."
                    className="bg-neutral-800 border-neutral-700 text-white flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addRule()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addRule}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {rules.length === 0 ? (
                    <p className="text-neutral-500 text-sm py-4 text-center">No rules added yet</p>
                  ) : (
                    rules.map((rule, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-neutral-800 border border-neutral-700 rounded-lg group"
                      >
                        <span className="text-orange-500 font-bold min-w-[24px]">{index + 1}.</span>
                        <p className="text-white flex-1">{rule.rule_text}</p>
                        <button
                          type="button"
                          onClick={() => removeRule(index)}
                          className="text-neutral-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-white">Markdown Content</Label>
                  <p className="text-sm text-neutral-400">
                    Write detailed content using Markdown. This will be rendered on the event page.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-neutral-400 text-sm">Editor</Label>
                    <Textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder={`# Event Title\n\n## About\nWrite your event details here...\n\n## Schedule\n- 9:00 AM - Registration\n- 10:00 AM - Event Begins\n\n## Prizes\n| Position | Prize |\n|----------|-------|\n| 1st | ₹10,000 |\n| 2nd | ₹5,000 |`}
                      className="bg-neutral-800 border-neutral-700 text-white min-h-[400px] font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-neutral-400 text-sm">Preview</Label>
                    <div className="bg-neutral-800 border border-neutral-700 rounded-md p-4 min-h-[400px] overflow-y-auto prose prose-invert prose-sm max-w-none">
                      {formData.content ? (
                        <ReactMarkdown>{formData.content}</ReactMarkdown>
                      ) : (
                        <p className="text-neutral-500 italic">Preview will appear here...</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </div>
      </ScrollArea>
    </div>

      <div className="flex-shrink-0 p-6 border-t border-neutral-800 bg-neutral-900">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            className="border-neutral-700 text-white hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="event-form"
            disabled={submitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>

      {/* Events Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Event Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Visibility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Registration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Entry Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Prize
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {events.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                  No events found. Create your first event!
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-neutral-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {event.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    {event.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.visibility === 'public' 
                        ? 'bg-green-500/10 text-green-500' 
                        : event.visibility === 'draft'
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-neutral-500/10 text-neutral-500'
                    }`}>
                      {event.visibility}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.registration_open 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {event.registration_open ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    {event.entry_fee > 0 ? `₹${event.entry_fee.toLocaleString()}` : 'Free'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    ₹{(event.prize_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/events/${event.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => openEditModal(event)}
                        className="p-2 text-neutral-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-neutral-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
