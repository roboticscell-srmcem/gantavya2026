"use client"

import Link from 'next/link'
import { BooleanBadge, ActionButtons } from '@/components/admin'

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

interface TeamsTableProps {
  teams: Team[]
}

export function TeamsTable({ teams }: TeamsTableProps) {
  if (teams.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 sm:p-12 text-center">
        <p className="text-neutral-500">No teams found</p>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-800">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Team Name
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Event
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                College
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Captain
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-neutral-800/50 cursor-pointer">
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  <Link href={`/admin/teams/${team.id}`} className="hover:text-orange-500 transition-colors">
                    {team.team_name}
                  </Link>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                  {team.events?.name || 'N/A'}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                  {team.college_name || 'N/A'}
                </td>
                <td className="px-4 lg:px-6 py-4 text-sm text-neutral-400">
                  <div className="max-w-[180px]">
                    <div className="truncate">{team.captain_name}</div>
                    <div className="text-xs text-neutral-500 truncate">{team.captain_email}</div>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                  ₹{team.total_amount_payable}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <BooleanBadge 
                    value={team.has_paid} 
                    trueLabel="Paid" 
                    falseLabel="Pending" 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden divide-y divide-neutral-800">
        {teams.map((team) => (
          <Link 
            key={team.id} 
            href={`/admin/teams/${team.id}`}
            className="block p-4 space-y-3 hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-white truncate">{team.team_name}</h3>
                <p className="text-sm text-neutral-400 truncate">{team.events?.name || 'N/A'}</p>
              </div>
              <BooleanBadge 
                value={team.has_paid} 
                trueLabel="Paid" 
                falseLabel="Pending" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="min-w-0">
                <span className="text-neutral-500">College: </span>
                <span className="text-white truncate block">{team.college_name || 'N/A'}</span>
              </div>
              <div className="min-w-0">
                <span className="text-neutral-500">Amount: </span>
                <span className="text-white">₹{team.total_amount_payable}</span>
              </div>
            </div>
            
            <div className="text-sm min-w-0">
              <span className="text-neutral-500">Captain: </span>
              <span className="text-white truncate block">{team.captain_name}</span>
              <span className="text-neutral-500 text-xs truncate block">{team.captain_email}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
