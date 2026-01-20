"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, X, CalendarIcon, Upload, FileText, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { FormSheet } from '@/components/admin'
import { ErrorMessage } from '@/components/admin'

interface EventRule {
  id?: string
  rule_text: string
}

interface EventFormData {
  name: string
  slug: string
  brief: string
  description: string
  min_team_size: number
  max_team_size: number
  prize_amount: number
  entry_fee: number
  venue: string
  visibility: string
  registration_open: boolean
  start_time: Date | null
  rulebook_url: string
  banner_url: string
  content: string
}

interface EventFormSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  formData: EventFormData
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onDateChange: (date: Date | null) => void
  rules: EventRule[]
  onAddRule: (rule: string) => void
  onRemoveRule: (index: number) => void
  onSubmit: (e: React.FormEvent) => void
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearBanner: () => void
  submitting: boolean
  uploading: boolean
  uploadingBanner: boolean
  error: string
}

export function EventFormSheet({
  isOpen,
  onOpenChange,
  isEditing,
  formData,
  onFormChange,
  onDateChange,
  rules,
  onAddRule,
  onRemoveRule,
  onSubmit,
  onFileUpload,
  onBannerUpload,
  onClearBanner,
  submitting,
  uploading,
  uploadingBanner,
  error
}: EventFormSheetProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [newRule, setNewRule] = useState('')

  const handleAddRule = () => {
    if (newRule.trim()) {
      onAddRule(newRule.trim())
      setNewRule('')
    }
  }

  return (
    <FormSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Event' : 'Create New Event'}
      formId="event-form"
      onSubmit={onSubmit}
      submitLabel={submitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
      submitDisabled={submitting}
      width="lg"
    >
      {error && <ErrorMessage message={error} />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-neutral-800 mb-4">
          <TabsTrigger value="basic" className="data-[state=active]:bg-orange-600 text-xs sm:text-sm">Basic</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-orange-600 text-xs sm:text-sm">Details</TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-orange-600 text-xs sm:text-sm">Rules</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-orange-600 text-xs sm:text-sm">Content</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white text-sm">Event Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                placeholder="e.g., Code Wars"
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-white text-sm">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={onFormChange}
                placeholder="e.g., code-wars"
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brief" className="text-white text-sm">Brief Description *</Label>
            <Input
              id="brief"
              name="brief"
              value={formData.brief}
              onChange={onFormChange}
              placeholder="Short description for event cards"
              className="bg-neutral-800 border-neutral-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white text-sm">Full Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onFormChange}
              placeholder="Detailed event description"
              className="bg-neutral-800 border-neutral-700 text-white min-h-[120px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visibility" className="text-white text-sm">Visibility</Label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={onFormChange}
                className="w-full h-10 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white text-sm"
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
                  onChange={onFormChange}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 accent-orange-600"
                />
                <span className="text-white text-sm">Registration Open</span>
              </label>
            </div>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_team_size" className="text-white text-sm">Min Team Size</Label>
              <Input
                id="min_team_size"
                name="min_team_size"
                type="number"
                min="1"
                value={formData.min_team_size}
                onChange={onFormChange}
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_team_size" className="text-white text-sm">Max Team Size</Label>
              <Input
                id="max_team_size"
                name="max_team_size"
                type="number"
                min="1"
                value={formData.max_team_size}
                onChange={onFormChange}
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_fee" className="text-white text-sm">Entry Fee (₹)</Label>
              <Input
                id="entry_fee"
                name="entry_fee"
                type="number"
                min="0"
                value={formData.entry_fee}
                onChange={onFormChange}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prize_amount" className="text-white text-sm">Prize Amount (₹)</Label>
              <Input
                id="prize_amount"
                name="prize_amount"
                type="number"
                min="0"
                value={formData.prize_amount}
                onChange={onFormChange}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue" className="text-white text-sm">Venue</Label>
              <Input
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={onFormChange}
                placeholder="e.g., Main Auditorium"
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white text-sm">Event Date & Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 text-sm"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_time ? format(formData.start_time, "PPP p") : "Pick date & time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-neutral-800 border-neutral-700" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_time || undefined}
                    onSelect={(date) => onDateChange(date || null)}
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
                        onDateChange(newDate)
                      }}
                      className="mt-1 bg-neutral-700 border-neutral-600 text-white"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Rulebook Upload */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Rulebook PDF</Label>
            <div className="flex gap-2">
              <Input
                id="rulebook_url"
                name="rulebook_url"
                value={formData.rulebook_url}
                onChange={onFormChange}
                placeholder="URL to rulebook PDF or upload below"
                className="bg-neutral-800 border-neutral-700 text-white flex-1 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
              <label className="flex items-center gap-2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md cursor-pointer hover:bg-neutral-700 transition-colors">
                <Upload className="w-4 h-4 text-neutral-400" />
                <span className="text-xs sm:text-sm text-neutral-300">
                  {uploading ? 'Uploading...' : 'Upload PDF'}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={onFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {formData.rulebook_url && (
                <a
                  href={formData.rulebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-orange-500 hover:text-orange-400 text-xs sm:text-sm"
                >
                  <FileText className="w-4 h-4" />
                  View PDF
                </a>
              )}
            </div>
          </div>

          {/* Banner Upload */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Event Banner Image</Label>
            <p className="text-xs text-neutral-400">Upload a banner image (PNG, JPG, WebP - max 5MB)</p>
            <div className="flex gap-2">
              <Input
                id="banner_url"
                name="banner_url"
                value={formData.banner_url}
                onChange={onFormChange}
                placeholder="URL to banner image or upload below"
                className="bg-neutral-800 border-neutral-700 text-white flex-1 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
              <label className="flex items-center gap-2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md cursor-pointer hover:bg-neutral-700 transition-colors">
                <ImageIcon className="w-4 h-4 text-neutral-400" />
                <span className="text-xs sm:text-sm text-neutral-300">
                  {uploadingBanner ? 'Uploading...' : 'Upload Image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onBannerUpload}
                  className="hidden"
                  disabled={uploadingBanner}
                />
              </label>
              {formData.banner_url && (
                <button
                  type="button"
                  onClick={onClearBanner}
                  className="flex items-center gap-2 text-red-500 hover:text-red-400 text-xs sm:text-sm"
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
                  className="w-full h-32 sm:h-40 object-cover"
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white text-sm">Event Rules</Label>
            <p className="text-xs text-neutral-400">Add rules for the event. These will be displayed on the event page.</p>
          </div>

          <div className="flex gap-2">
            <Input
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="Enter a rule..."
              className="bg-neutral-800 border-neutral-700 text-white flex-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddRule()
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddRule}
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
                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-neutral-800 border border-neutral-700 rounded-lg group"
                >
                  <span className="text-orange-500 font-bold min-w-[20px] text-sm">{index + 1}.</span>
                  <p className="text-white flex-1 text-sm">{rule.rule_text}</p>
                  <button
                    type="button"
                    onClick={() => onRemoveRule(index)}
                    className="text-neutral-500 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white text-sm">Markdown Content</Label>
            <p className="text-xs text-neutral-400">
              Write detailed content using Markdown. This will be rendered on the event page.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs">Editor</Label>
              <Textarea
                name="content"
                value={formData.content}
                onChange={onFormChange}
                placeholder={`# Event Title\n\n## About\nWrite your event details here...\n\n## Schedule\n- 9:00 AM - Registration\n- 10:00 AM - Event Begins\n\n## Prizes\n| Position | Prize |\n|----------|-------|\n| 1st | ₹10,000 |\n| 2nd | ₹5,000 |`}
                className="bg-neutral-800 border-neutral-700 text-white min-h-[300px] lg:min-h-[400px] font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs">Preview</Label>
              <div className="bg-neutral-800 border border-neutral-700 rounded-md p-4 min-h-[300px] lg:min-h-[400px] overflow-y-auto prose prose-invert prose-sm max-w-none">
                {formData.content ? (
                  <ReactMarkdown>{formData.content}</ReactMarkdown>
                ) : (
                  <p className="text-neutral-500 italic text-sm">Preview will appear here...</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </FormSheet>
  )
}
