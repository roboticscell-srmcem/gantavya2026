import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for manual team creation
const manualTeamSchema = z.object({
  event_id: z.string().uuid('Invalid event ID'),
  team_name: z.string().min(1, 'Team name is required'),
  college_name: z.string().min(1, 'College name is required'),
  captain_name: z.string().min(1, 'Captain name is required'),
  captain_email: z.string().email('Invalid captain email'),
  captain_phone: z.string().min(10, 'Phone must be at least 10 digits'),
  payment_mode: z.enum(['cash', 'online']),
  has_paid: z.boolean(),
  amount_paid: z.number().min(0).optional().default(0),
  members: z.array(z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
  })).optional().default([]),
})

// GET all teams with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event_id')
    const hasPaid = searchParams.get('has_paid')
    const collegeName = searchParams.get('college_name')

    // Use service client to bypass RLS for admin operations
    const supabase = createServiceClient()
    
    let query = supabase
      .from('teams')
      .select(`
        *,
        events (
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    if (hasPaid !== null) {
      query = query.eq('has_paid', hasPaid === 'true')
    }

    if (collegeName) {
      query = query.ilike('college_name', `%${collegeName}%`)
    }

    const { data: teams, error } = await query

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      )
    }

    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create team manually (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('Received team creation request:', JSON.stringify(body, null, 2))
    
    // Validate input
    const validation = manualTeamSchema.safeParse(body)
    if (!validation.success) {
      console.error('Validation errors:', validation.error.issues)
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { 
      event_id, 
      team_name, 
      college_name, 
      captain_name, 
      captain_email, 
      captain_phone,
      payment_mode,
      has_paid,
      amount_paid,
      members = [] 
    } = validation.data

    // Use service client to bypass RLS for admin operations
    const supabase = createServiceClient()

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, entry_fee')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if captain email is already registered for this event
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('captain_email', captain_email)
      .eq('event_id', event_id)
      .single()

    if (existingTeam) {
      return NextResponse.json(
        { error: 'This email is already registered for this event' },
        { status: 400 }
      )
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        event_id,
        team_name,
        college_name,
        captain_name,
        captain_email,
        total_amount_payable: amount_paid || event.entry_fee || 0,
        currency: 'INR',
        has_paid,
        payment_gateway: payment_mode === 'cash' ? 'cash' : 'razorpay',
        payment_status: has_paid ? 'captured' : 'created',
        is_active: true,
      })
      .select()
      .single()

    if (teamError || !team) {
      console.error('Error creating team:', teamError)
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      )
    }

    // Add captain as team member
    const { error: captainError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        member_name: captain_name,
        member_email: captain_email,
        member_contact: captain_phone,
        role: 'captain',
        is_active: true,
      })

    if (captainError) {
      console.error('Error adding captain:', captainError)
      // Rollback: delete team
      await supabase.from('teams').delete().eq('id', team.id)
      return NextResponse.json(
        { error: 'Failed to add captain to team' },
        { status: 500 }
      )
    }

    // Add additional members if provided
    if (members.length > 0) {
      const teamMembers = members.map(member => ({
        team_id: team.id,
        member_name: member.name,
        member_email: member.email,
        member_contact: member.phone,
        role: 'member',
        is_active: true,
      }))

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(teamMembers)

      if (membersError) {
        console.error('Error adding members:', membersError)
        // Continue anyway - members can be added later
      }
    }

    return NextResponse.json({
      success: true,
      team_id: team.id,
      message: 'Team created successfully',
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
