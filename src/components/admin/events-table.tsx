"use client"

import { StatusBadge, BooleanBadge, ActionButtons } from '@/components/admin'

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

interface EventsTableProps {
  events: Event[]
  onEdit: (event: Event) => void
  onDelete: (id: string) => void
}

export function EventsTable({ events, onEdit, onDelete }: EventsTableProps) {
  if (events.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 sm:p-12 text-center">
        <p className="text-neutral-500">No events found. Create your first event!</p>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-800">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Event Name
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Visibility
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Registration
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Entry Fee
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Prize
              </th>
              <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-neutral-800/50">
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {event.name}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                  {event.slug}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <StatusBadge 
                    status={event.visibility as 'public' | 'draft' | 'hidden' | 'archived'} 
                  />
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <BooleanBadge 
                    value={event.registration_open} 
                    trueLabel="Open" 
                    falseLabel="Closed" 
                  />
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                  {event.entry_fee > 0 ? `₹${event.entry_fee.toLocaleString()}` : 'Free'}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                  ₹{(event.prize_amount || 0).toLocaleString()}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ActionButtons
                    viewHref={`/events/${event.slug}`}
                    onEdit={() => onEdit(event)}
                    onDelete={() => onDelete(event.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-neutral-800">
        {events.map((event) => (
          <div key={event.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-white">{event.name}</h3>
                <p className="text-sm text-neutral-400">{event.slug}</p>
              </div>
              <ActionButtons
                viewHref={`/events/${event.slug}`}
                onEdit={() => onEdit(event)}
                onDelete={() => onDelete(event.id)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <StatusBadge 
                status={event.visibility as 'public' | 'draft' | 'hidden' | 'archived'} 
              />
              <BooleanBadge 
                value={event.registration_open} 
                trueLabel="Open" 
                falseLabel="Closed" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-neutral-500">Entry Fee: </span>
                <span className="text-white">
                  {event.entry_fee > 0 ? `₹${event.entry_fee.toLocaleString()}` : 'Free'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Prize: </span>
                <span className="text-white">₹{(event.prize_amount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
