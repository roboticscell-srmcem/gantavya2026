import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail, getRegistrationConfirmationEmail } from '@/lib/email'
import { generateEventPassBase64 } from '@/lib/pass-generator'
import { generatePassesForTeam } from '@/lib/pass-generation'

// GET team details with members
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    // Fetch team with event details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select(`
        *,
        events (
          name,
          slug,
          start_time,
          venue
        )
      `)
      .eq('id', id)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Fetch team members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', id)
      .order('role', { ascending: false }) // Captain first

    if (membersError) {
      // Members fetch failed
    }

    return NextResponse.json({
      team,
      members: members || []
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update team
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()
    const body = await request.json()

    // Get the current team state before update
    const { data: currentTeam, error: fetchError } = await supabase
      .from('teams')
      .select(`
        *,
        events (
          name,
          slug,
          start_time,
          venue
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !currentTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const wasUnpaid = !currentTeam.has_paid
    const isBeingVerified = body.has_paid === true && (
      body.payment_status === 'completed' || 
      body.payment_status === 'captured' ||
      currentTeam.payment_status === 'pending_verification'
    )

    // If payment is being verified, set passes_generated to false for later processing
    if (wasUnpaid && isBeingVerified) {
      body.passes_generated = false
    }

    // Update the team
    const { data: team, error } = await supabase
      .from('teams')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update team', details: error.message },
        { status: 500 }
      )
    }

    // Trigger pass generation immediately after payment verification
    if (wasUnpaid && isBeingVerified) {
      console.log(`💰 Payment verified for team ${team.id}. Triggering pass generation...`)
      
      try {
        const result = await generatePassesForTeam(team.id)
        console.log(`✅ Pass generation completed for team ${team.id}:`, result)
      } catch (error) {
        console.error(`❌ Failed to generate passes for team ${team.id}:`, error)
      }
    }

    return NextResponse.json({ 
      team,
      passesTriggered: wasUnpaid && isBeingVerified
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
