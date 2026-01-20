import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const memberSchema = z.object({
  member_name: z.string().min(2, 'Name must be at least 2 characters'),
  member_email: z.string().email('Invalid email address'),
  member_contact: z.string().regex(/^[0-9]{10}$/, 'Contact must be 10 digits'),
})

const registrationSchema = z.object({
  event_id: z.string().uuid('Invalid event ID'),
  team_name: z.string().min(2, 'Team name must be at least 2 characters'),
  college_name: z.string().min(2, 'College name must be at least 2 characters'),
  captain: z.object({
    name: z.string().min(2, 'Captain name must be at least 2 characters'),
    email: z.string().email('Invalid captain email'),
    contact: z.string().regex(/^[0-9]{10}$/, 'Contact must be 10 digits'),
  }),
  members: z.array(memberSchema).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = registrationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { event_id, team_name, college_name, captain, members = [] } = validation.data

    const supabase = createServiceClient()

    // 1. Check if event exists and registration is open
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, min_team_size, max_team_size, registration_open, entry_fee')
      .eq('id', event_id)
      .eq('visibility', 'public')
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found or not available for registration' },
        { status: 404 }
      )
    }

    if (!event.registration_open) {
      return NextResponse.json(
        { error: 'Registration is closed for this event' },
        { status: 400 }
      )
    }

    // 2. Validate team size
    const totalMembers = 1 + members.length // captain + members
    if (totalMembers < event.min_team_size || totalMembers > event.max_team_size) {
      return NextResponse.json(
        { 
          error: `Team size must be between ${event.min_team_size} and ${event.max_team_size} members`,
          current_size: totalMembers 
        },
        { status: 400 }
      )
    }

    // 3. Check if captain email is already registered
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('captain_email', captain.email)
      .eq('event_id', event_id)
      .single()

    if (existingTeam) {
      return NextResponse.json(
        { error: 'This email is already registered for this event' },
        { status: 400 }
      )
    }

    // 4. Calculate total amount from event's entry_fee
    const registrationFee = event.entry_fee || 0

    // 5. Insert team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        event_id,
        team_name,
        college_name,
        captain_name: captain.name,
        captain_email: captain.email,
        total_amount_payable: registrationFee,
        currency: 'INR',
        has_paid: false,
        payment_gateway: 'razorpay',
        payment_status: 'created',
        is_active: true,
      })
      .select()
      .single()

    if (teamError || !team) {
      console.error('Error creating team:', teamError)
      return NextResponse.json(
        { error: 'Failed to create team registration' },
        { status: 500 }
      )
    }

    // 6. Insert captain as team member
    const captainMember = {
      team_id: team.id,
      member_name: captain.name,
      member_email: captain.email,
      member_contact: captain.contact,
      role: 'captain' as const,
      is_active: true,
    }

    const { error: captainError } = await supabase
      .from('team_members')
      .insert(captainMember)

    if (captainError) {
      console.error('Error adding captain:', captainError)
      // Rollback: delete team
      await supabase.from('teams').delete().eq('id', team.id)
      return NextResponse.json(
        { error: 'Failed to add captain to team' },
        { status: 500 }
      )
    }

    // 7. Insert other members if provided
    if (members.length > 0) {
      const teamMembers = members.map(member => ({
        team_id: team.id,
        ...member,
        role: 'member' as const,
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
      amount_payable: team.total_amount_payable,
      message: 'Team registered successfully',
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
