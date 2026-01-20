"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Mail, Phone, User } from 'lucide-react'
import { PageHeader, LoadingSpinner, BooleanBadge } from '@/components/admin'

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
  payment_mode: string
  payment_order_id: string
  created_at: string
  events: {
    name: string
    slug: string
    start_time: string
    venue: string
  }
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{title}</h2>
      {children}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <div className="text-sm sm:text-base text-white">{value}</div>
    </div>
  )
}

export default function TeamDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [team, setTeam] = useState<TeamDetails | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTeamDetails = useCallback(async () => {
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
  }, [params.id])

  useEffect(() => {
    fetchTeamDetails()
  }, [fetchTeamDetails])

  if (loading) {
    return <LoadingSpinner message="Loading team details..." />
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">Team not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={team.team_name}
        description={team.events?.name || 'Event'}
        backHref="/admin/teams"
      />

      {/* Team Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Basic Info */}
        <InfoCard title="Team Information">
          <div className="space-y-3">
            <InfoItem label="College" value={team.college_name || 'N/A'} />
            <InfoItem label="Captain" value={team.captain_name} />
            <InfoItem label="Email" value={
              <span className="break-all">{team.captain_email}</span>
            } />
            <InfoItem 
              label="Registered On" 
              value={new Date(team.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })} 
            />
          </div>
        </InfoCard>

        {/* Payment Info */}
        <InfoCard title="Payment Information">
          <div className="space-y-3">
            <InfoItem 
              label="Amount" 
              value={<span className="text-xl sm:text-2xl font-bold">₹{team.total_amount_payable}</span>} 
            />
            <div>
              <p className="text-xs text-neutral-400 mb-1">Status</p>
              <BooleanBadge 
                value={team.has_paid} 
                trueLabel="Paid" 
                falseLabel="Pending" 
              />
            </div>
            {team.payment_mode && (
              <InfoItem label="Payment Mode" value={team.payment_mode.toUpperCase()} />
            )}
            {team.payment_order_id && (
              <div>
                <p className="text-xs text-neutral-400 mb-1">Order ID</p>
                <p className="text-xs text-white font-mono break-all">{team.payment_order_id}</p>
              </div>
            )}
          </div>
        </InfoCard>
      </div>

      {/* Team Members */}
      <InfoCard title={`Team Members (${members.length})`}>
        <div className="space-y-3">
          {members.length === 0 ? (
            <p className="text-neutral-400 text-sm text-center py-4">No members found</p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="bg-neutral-800 rounded-lg p-3 sm:p-4"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                    member.role === 'captain' 
                      ? 'bg-orange-500/10 text-orange-500' 
                      : 'bg-neutral-700 text-neutral-400'
                  }`}>
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm sm:text-base text-white font-medium truncate">{member.member_name}</p>
                      {member.role === 'captain' && (
                        <span className="px-2 py-0.5 text-xs bg-orange-500/10 text-orange-500 rounded shrink-0">
                          Captain
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                      <p className="text-xs sm:text-sm text-neutral-400 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{member.member_email}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 shrink-0" />
                        {member.member_contact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </InfoCard>
    </div>
  )
}
