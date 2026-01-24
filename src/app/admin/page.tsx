"use client"

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Calendar, Users, DollarSign } from 'lucide-react'
import { LoadingSpinner, StatsGrid, StatsCard } from '@/components/admin'

interface KPIData {
  event_kpis: any[]
  global_stats: {
    total_events: number
    total_teams: number
    total_participants: number
    total_revenue: number
    paid_teams: number
  }
  payment_distribution: Record<string, number>
}

interface QuickActionCardProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

function QuickActionCard({ href, icon: Icon, title, description }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 sm:p-6 hover:border-orange-500 transition-colors group"
    >
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
      <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-neutral-400">{description}</p>
    </Link>
  )
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchKPIs = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/kpis')
      if (response.ok) {
        const data = await response.json()
        setKpis(data)
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKPIs()
  }, [fetchKPIs])

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  const stats = [
    {
      name: 'Total Events',
      value: kpis?.global_stats.total_events || 0,
      icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Total Teams',
      value: kpis?.global_stats.total_teams || 0,
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      name: 'Total Participants',
      value: kpis?.global_stats.total_participants || 0,
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      name: 'Total Revenue',
      value: `₹${kpis?.global_stats.total_revenue.toLocaleString() || 0}`,
      icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-neutral-400">Overview of your event management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-neutral-400 mb-1 truncate">{stat.name}</p>
                <p className="text-lg sm:text-2xl font-bold text-white truncate">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-2 sm:p-3 rounded-lg shrink-0`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <QuickActionCard
            href="/admin/events"
            icon={Calendar}
            title="Manage Events"
            description="Create and edit events"
          />
          <QuickActionCard
            href="/admin/teams"
            icon={Users}
            title="View Teams"
            description="Monitor registrations"
          />
          <QuickActionCard
            href="/admin/payments"
            icon={DollarSign}
            title="Payment Status"
            description="Track payments"
          />
        </div>
      </div>

      {/* Event KPIs Table */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Event Performance</h2>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Teams
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {kpis?.event_kpis?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-400">
                      No events found
                    </td>
                  </tr>
                ) : (
                  kpis?.event_kpis.map((event: any) => (
                    <tr key={event.event_id} className="hover:bg-neutral-800/50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {event.event_name}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                        {event.total_teams}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                        {event.total_participants}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                        {event.paid_teams}/{event.total_teams}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-green-500">
                        ₹{event.total_collection.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-neutral-800">
            {kpis?.event_kpis?.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                No events found
              </div>
            ) : (
              kpis?.event_kpis.map((event: any) => (
                <div key={event.event_id} className="p-4 space-y-2">
                  <h3 className="font-medium text-white">{event.event_name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-neutral-500">Teams: </span>
                      <span className="text-white">{event.total_teams}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Participants: </span>
                      <span className="text-white">{event.total_participants}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Paid: </span>
                      <span className="text-white">{event.paid_teams}/{event.total_teams}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Revenue: </span>
                      <span className="text-green-500">₹{event.total_collection.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
