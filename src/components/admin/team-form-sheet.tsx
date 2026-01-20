"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { FormSheet } from '@/components/admin'

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

interface TeamFormData {
  event_id: string
  team_name: string
  college_name: string
  captain_name: string
  captain_email: string
  captain_phone: string
  payment_mode: 'cash' | 'online'
  has_paid: boolean
  amount_paid: number
}

interface TeamFormSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  events: Event[]
  formData: TeamFormData
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  members: TeamMemberInput[]
  onAddMember: () => void
  onRemoveMember: (index: number) => void
  onUpdateMember: (index: number, field: keyof TeamMemberInput, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  submitting: boolean
  submitStatus: 'idle' | 'success' | 'error'
  submitMessage: string
}

export function TeamFormSheet({
  isOpen,
  onOpenChange,
  events,
  formData,
  onFormChange,
  members,
  onAddMember,
  onRemoveMember,
  onUpdateMember,
  onSubmit,
  submitting,
  submitStatus,
  submitMessage
}: TeamFormSheetProps) {
  return (
    <FormSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Add Team Manually"
      formId="team-form"
      onSubmit={onSubmit}
      submitLabel={submitting ? 'Adding...' : 'Add Team'}
      submitDisabled={submitting}
      width="md"
    >
      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="mb-4 p-3 sm:p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-300 text-sm">Success!</h3>
            <p className="text-xs sm:text-sm text-green-200">{submitMessage}</p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-4 p-3 sm:p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-300 text-sm">Error</h3>
            <p className="text-xs sm:text-sm text-red-200">{submitMessage}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Event Selection */}
        <div className="space-y-2">
          <Label htmlFor="event_id" className="text-white text-sm">Event *</Label>
          <select
            id="event_id"
            name="event_id"
            value={formData.event_id}
            onChange={onFormChange}
            className="w-full h-10 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-white text-sm"
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
          <Label htmlFor="team_name" className="text-white text-sm">Team Name *</Label>
          <Input
            id="team_name"
            name="team_name"
            value={formData.team_name}
            onChange={onFormChange}
            placeholder="Enter team name"
            className="bg-neutral-800 border-neutral-700 text-white text-sm"
            required
          />
        </div>

        {/* College Name */}
        <div className="space-y-2">
          <Label htmlFor="college_name" className="text-white text-sm">College/Institution *</Label>
          <Input
            id="college_name"
            name="college_name"
            value={formData.college_name}
            onChange={onFormChange}
            placeholder="Enter college name"
            className="bg-neutral-800 border-neutral-700 text-white text-sm"
            required
          />
        </div>

        {/* Captain Details */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-white border-b border-neutral-800 pb-2">
            Captain Details
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="captain_name" className="text-white text-sm">Full Name *</Label>
              <Input
                id="captain_name"
                name="captain_name"
                value={formData.captain_name}
                onChange={onFormChange}
                placeholder="Captain's full name"
                className="bg-neutral-800 border-neutral-700 text-white text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="captain_email" className="text-white text-sm">Email *</Label>
              <Input
                id="captain_email"
                name="captain_email"
                type="email"
                value={formData.captain_email}
                onChange={onFormChange}
                placeholder="captain@example.com"
                className="bg-neutral-800 border-neutral-700 text-white text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="captain_phone" className="text-white text-sm">Phone *</Label>
              <Input
                id="captain_phone"
                name="captain_phone"
                value={formData.captain_phone}
                onChange={onFormChange}
                placeholder="9876543210"
                className="bg-neutral-800 border-neutral-700 text-white text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-white">Team Members (Optional)</h3>
            <Button type="button" variant="outline" size="sm" onClick={onAddMember} className="text-xs sm:text-sm">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Add Member
            </Button>
          </div>
          
          {members.map((member, index) => (
            <div key={index} className="p-3 sm:p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-neutral-400">Member {index + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemoveMember(index)}
                  className="p-1 hover:bg-neutral-700 rounded"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <Input
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => onUpdateMember(index, 'name', e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white text-sm"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={member.email}
                  onChange={(e) => onUpdateMember(index, 'email', e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white text-sm"
                />
                <Input
                  placeholder="Phone"
                  value={member.phone}
                  onChange={(e) => onUpdateMember(index, 'phone', e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Payment Details */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-white border-b border-neutral-800 pb-2">
            Payment Details
          </h3>
          
          <div className="space-y-2">
            <Label className="text-white text-sm">Payment Mode *</Label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment_mode"
                  value="cash"
                  checked={formData.payment_mode === 'cash'}
                  onChange={onFormChange}
                  className="accent-orange-600"
                />
                <span className="text-white text-sm">Cash</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment_mode"
                  value="online"
                  checked={formData.payment_mode === 'online'}
                  onChange={onFormChange}
                  className="accent-orange-600"
                />
                <span className="text-white text-sm">Online (Manual Entry)</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount_paid" className="text-white text-sm">Amount (₹)</Label>
            <Input
              id="amount_paid"
              name="amount_paid"
              type="number"
              value={formData.amount_paid}
              onChange={onFormChange}
              className="bg-neutral-800 border-neutral-700 text-white text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="has_paid"
              name="has_paid"
              checked={formData.has_paid}
              onChange={onFormChange}
              className="accent-orange-600 w-4 h-4"
            />
            <Label htmlFor="has_paid" className="text-white cursor-pointer text-sm">
              Mark as Paid
            </Label>
          </div>
        </div>
      </div>
    </FormSheet>
  )
}
