import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendEmail, getRegistrationReceivedEmail } from '@/lib/email'

// Validation schemas
const memberSchema = z.object({
  member_name: z.string().min(2, 'Name must be at least 2 characters'),
  member_email: z.string().email('Invalid email address'),
  member_contact: z.string().regex(/^[0-9]{10}$/, 'Contact must be 10 digits'),
})

const paymentSchema = z.object({
  transaction_id: z.string().min(6, 'Transaction ID must be at least 6 characters'),
  account_holder_name: z.string().min(2, 'Account holder name must be at least 2 characters'),
  amount: z.number().positive('Amount must be positive'),
}).nullable().optional()

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
  payment: paymentSchema,
})

export async function POST(request: Request) {
  const supabase = createServiceClient()
  let createdTeamId: string | null = null
  
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

    const { event_id, team_name, college_name, captain, members = [], payment } = validation.data

    // 1. Check if event exists and registration is open
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, min_team_size, max_team_size, registration_open, entry_fee')
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

    // 3. Check if captain email is already registered for this event
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

    // 4. Check if any member email is already registered for this event
    if (members.length > 0) {
      const memberEmails = members.map(m => m.member_email)
      const { data: existingMembers } = await supabase
        .from('team_members')
        .select('member_email, teams!inner(event_id)')
        .in('member_email', memberEmails)
        .eq('teams.event_id', event_id)

      if (existingMembers && existingMembers.length > 0) {
        const duplicateEmail = existingMembers[0].member_email
        return NextResponse.json(
          { error: `Email ${duplicateEmail} is already registered for this event` },
          { status: 400 }
        )
      }
    }

    // 5. Calculate total amount from event's entry_fee
    const registrationFee = event.entry_fee || 0

    // === BEGIN TRANSACTION-LIKE OPERATIONS ===
    // All operations below must succeed, or we rollback

    // 6. Insert team with payment details
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
        has_paid: registrationFee === 0, // Only mark paid if free event
        payment_gateway: payment ? 'upi' : (registrationFee === 0 ? 'free' : 'pending'),
        payment_status: payment ? 'pending_verification' : (registrationFee === 0 ? 'completed' : 'not_required'),
        transaction_id: payment?.transaction_id || null,
        account_holder_name: payment?.account_holder_name || null,
        is_active: true,
      })
      .select()
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Failed to create team registration' },
        { status: 500 }
      )
    }

    createdTeamId = team.id

    // 7. Insert captain as team member
    const { error: captainError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        member_name: captain.name,
        member_email: captain.email,
        member_contact: captain.contact,
        role: 'captain' as const,
        is_active: true,
      })

    if (captainError) {
      // Rollback: delete team
      await supabase.from('teams').delete().eq('id', team.id)
      createdTeamId = null
      return NextResponse.json(
        { error: 'Failed to add captain to team. Registration cancelled.' },
        { status: 500 }
      )
    }

    // 8. Insert other members if provided
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
        // Rollback: delete team members and team
        await supabase.from('team_members').delete().eq('team_id', team.id)
        await supabase.from('teams').delete().eq('id', team.id)
        createdTeamId = null
        return NextResponse.json(
          { error: 'Failed to add team members. Registration cancelled.' },
          { status: 500 }
        )
      }
    }

    // === END TRANSACTION-LIKE OPERATIONS ===

    // 9. Send registration received email (payment pending verification)
    if (payment) {
      try {
        const teamId = team.team_code || team.id.slice(0, 8).toUpperCase()
        const totalMembers = 1 + members.length // captain + members

        const emailHtml = getRegistrationReceivedEmail({
          teamName: team_name,
          captainName: captain.name,
          eventName: event.name || 'Gantavya Event',
          teamId: teamId,
          collegeName: college_name,
          memberCount: totalMembers,
          transactionId: payment.transaction_id,
          totalAmount: registrationFee,
        })

        const emailResult = await sendEmail({
          to: captain.email,
          subject: `⏳ Registration Received - ${event.name || 'Gantavya Event'} | Gantavya 2026`,
          html: emailHtml,
        })

        if (!emailResult.success) {
          // Don't fail registration if email fails - team is already created
        }
      } catch {
        // Don't fail the registration if email fails
      }
    }

    return NextResponse.json({
      success: true,
      team_id: team.id,
      amount_payable: team.total_amount_payable,
      payment_status: payment ? 'pending_verification' : (registrationFee === 0 ? 'completed' : 'not_required'),
      message: payment 
        ? 'Registration submitted successfully. Your payment is pending verification. You will receive a confirmation email once verified.' 
        : 'Team registered successfully!',
    }, { status: 201 })

  } catch {
    // Attempt rollback if team was created
    if (createdTeamId) {
      try {
        await supabase.from('team_members').delete().eq('team_id', createdTeamId)
        await supabase.from('teams').delete().eq('id', createdTeamId)
      } catch {
        // Rollback failed
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
