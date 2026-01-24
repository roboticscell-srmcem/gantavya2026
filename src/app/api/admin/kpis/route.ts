import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Use service client to bypass RLS for admin operations
    const supabase = createServiceClient()

    // Fetch all teams with events
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select(`
        id,
        has_paid,
        total_amount_payable,
        payment_gateway,
        event_id,
        events (
          id,
          name
        )
      `)

    if (teamsError) {
      return NextResponse.json(
        { error: 'Failed to fetch KPIs' },
        { status: 500 }
      )
    }

    // Fetch team members count
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('team_id')

    // Fetch all events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, name')

    // Calculate event KPIs
    const eventKpis = (events || []).map(event => {
      const eventTeams = (teams || []).filter(t => t.event_id === event.id)
      const paidTeams = eventTeams.filter(t => t.has_paid)
      const totalCollection = paidTeams.reduce((sum, t) => sum + (Number(t.total_amount_payable) || 0), 0)
      const eventMembers = (members || []).filter(m => 
        eventTeams.some(t => t.id === m.team_id)
      )
      
      return {
        event_id: event.id,
        event_name: event.name,
        total_teams: eventTeams.length,
        paid_teams: paidTeams.length,
        total_participants: eventMembers.length,
        total_collection: totalCollection,
      }
    })

    // Calculate global stats
    const paidTeams = (teams || []).filter(t => t.has_paid)
    const totalRevenue = paidTeams.reduce((sum, t) => sum + (Number(t.total_amount_payable) || 0), 0)
    
    const global = {
      total_events: events?.length || 0,
      total_teams: teams?.length || 0,
      total_participants: members?.length || 0,
      total_revenue: totalRevenue,
      paid_teams: paidTeams.length,
    }

    // Payment mode distribution
    const paymentDistribution = paidTeams.reduce((acc: Record<string, number>, team) => {
      const mode = team.payment_gateway || 'unknown'
      acc[mode] = (acc[mode] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      event_kpis: eventKpis,
      global_stats: global,
      payment_distribution: paymentDistribution,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
