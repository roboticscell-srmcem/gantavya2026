"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, User, Save, Check, X, Edit2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TeamMember {
  id: string
  member_name: string
  member_email: string
  member_contact: string
  role: 'captain' | 'member'
  is_active: boolean
}

interface TeamDetails {
  id: string
  team_name: string
  college_name: string
  captain_name: string
  captain_email: string
  total_amount_payable: number
  has_paid: boolean
  payment_status: string
  payment_gateway: string
  razorpay_payment_id: string
  created_at: string
  events: {
    name: string
    slug: string
    start_time: string
    venue: string
  }
}

export default function TeamDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [team, setTeam] = useState<TeamDetails | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    team_name: '',
    college_name: '',
    has_paid: false,
    payment_gateway: '',
    total_amount_payable: 0,
  })

  useEffect(() => {
    fetchTeamDetails()
  }, [params.id])

  useEffect(() => {
    if (team) {
      setEditForm({
        team_name: team.team_name,
        college_name: team.college_name,
        has_paid: team.has_paid,
        payment_gateway: team.payment_gateway || 'upi',
        total_amount_payable: team.total_amount_payable,
      })
    }
  }, [team])

  async function fetchTeamDetails() {
    try {
      const response = await fetch(`/api/admin/teams/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTeam(data.team)
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Error fetching team details:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveMessage(null)
    
    try {
      const response = await fetch(`/api/admin/teams/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: editForm.team_name,
          college_name: editForm.college_name,
          has_paid: editForm.has_paid,
          payment_gateway: editForm.payment_gateway,
          payment_status: editForm.has_paid ? 'captured' : 'created',
          total_amount_payable: editForm.total_amount_payable,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTeam(prev => prev ? { ...prev, ...data.team } : null)
        setEditing(false)
        setSaveMessage({ type: 'success', text: 'Team updated successfully!' })
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        const error = await response.json()
        setSaveMessage({ type: 'error', text: error.error || 'Failed to update team' })
      }
    } catch (error) {
      console.error('Error updating team:', error)
      setSaveMessage({ type: 'error', text: 'Failed to update team' })
    } finally {
      setSaving(false)
    }
  }

  async function markAsPaid() {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/teams/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          has_paid: true,
          payment_status: 'captured',
          payment_gateway: 'upi',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTeam(prev => prev ? { ...prev, ...data.team } : null)
        setEditForm(prev => ({ ...prev, has_paid: true, payment_gateway: 'upi' }))
        setSaveMessage({ type: 'success', text: 'Payment marked as complete!' })
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error:', error)
      setSaveMessage({ type: 'error', text: 'Failed to update payment status' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">Team not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-neutral-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{team.team_name}</h1>
            <p className="text-neutral-400">{team.events?.name || 'No event'}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!team.has_paid && (
            <Button
              onClick={markAsPaid}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Mark as Paid
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setEditing(!editing)}
            className="border-neutral-800"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          saveMessage.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-500'
            : 'bg-red-500/10 border border-red-500/20 text-red-500'
        }`}>
          {saveMessage.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {saveMessage.text}
        </div>
      )}

      {/* Edit Form */}
      {editing && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-orange-500">Edit Team Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team_name" className="text-white">Team Name</Label>
              <Input
                id="team_name"
                value={editForm.team_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, team_name: e.target.value }))}
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="college_name" className="text-white">College Name</Label>
              <Input
                id="college_name"
                value={editForm.college_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, college_name: e.target.value }))}
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={editForm.total_amount_payable}
                onChange={(e) => setEditForm(prev => ({ ...prev, total_amount_payable: Number(e.target.value) }))}
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_gateway" className="text-white">Payment Mode</Label>
              <select
                id="payment_gateway"
                value={editForm.payment_gateway}
                onChange={(e) => setEditForm(prev => ({ ...prev, payment_gateway: e.target.value }))}
                className="w-full h-10 px-3 rounded-md bg-neutral-900 border border-neutral-700 text-white"
              >
                <option value="cash">Cash</option>
                <option value="razorpay">Online (Razorpay)</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="has_paid"
              checked={editForm.has_paid}
              onChange={(e) => setEditForm(prev => ({ ...prev, has_paid: e.target.checked }))}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-orange-500 focus:ring-orange-500"
            />
            <Label htmlFor="has_paid" className="text-white cursor-pointer">
              Payment Completed
            </Label>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false)
                if (team) {
                  setEditForm({
                    team_name: team.team_name,
                    college_name: team.college_name,
                    has_paid: team.has_paid,
                    payment_gateway: team.payment_gateway || 'upi',
                    total_amount_payable: team.total_amount_payable,
                  })
                }
              }}
              className="border-neutral-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Team Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Team Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-400 mb-1">College</p>
              <p className="text-white">{team.college_name}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Captain</p>
              <p className="text-white">{team.captain_name}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Email</p>
              <p className="text-white">{team.captain_email}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Registered On</p>
              <p className="text-white">
                {new Date(team.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Payment Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-400 mb-1">Amount</p>
              <p className="text-2xl font-bold text-white">₹{team.total_amount_payable}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                team.has_paid 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {team.has_paid ? 'Paid' : 'Pending'}
              </span>
            </div>
            {team.payment_gateway && (
              <div>
                <p className="text-xs text-neutral-400 mb-1">Payment Mode</p>
                <p className="text-white capitalize">{team.payment_gateway}</p>
              </div>
            )}
            {team.razorpay_payment_id && (
              <div>
                <p className="text-xs text-neutral-400 mb-1">Payment ID</p>
                <p className="text-xs text-white font-mono">{team.razorpay_payment_id}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Team Members ({members.length})</h2>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-neutral-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  member.role === 'captain' 
                    ? 'bg-orange-500/10 text-orange-500' 
                    : 'bg-neutral-700 text-neutral-400'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{member.member_name}</p>
                    {member.role === 'captain' && (
                      <span className="px-2 py-0.5 text-xs bg-orange-500/10 text-orange-500 rounded">
                        Captain
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1">
                    <p className="text-sm text-neutral-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.member_email}
                    </p>
                    <p className="text-sm text-neutral-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {member.member_contact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
