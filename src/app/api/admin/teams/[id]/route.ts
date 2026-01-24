import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail, getRegistrationConfirmationEmail } from '@/lib/email'
import { generateEventPassBase64 } from '@/lib/pass-generator'

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
      console.error('Error fetching members:', membersError)
    }

    return NextResponse.json({
      team,
      members: members || []
    })
  } catch (error) {
    console.error('Unexpected error:', error)
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

    // Update the team
    const { data: team, error } = await supabase
      .from('teams')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating team:', error)
      return NextResponse.json(
        { error: 'Failed to update team', details: error.message },
        { status: 500 }
      )
    }

    // Send confirmation email if payment was just verified
    if (wasUnpaid && isBeingVerified && currentTeam) {
      try {
        const eventName = currentTeam.events?.title || currentTeam.events?.name || 'Gantavya Event'
        const teamId = currentTeam.team_code || currentTeam.id.slice(0, 8).toUpperCase()

        // Get all team members (captain first, then members)
        const { data: members } = await supabase
          .from('team_members')
          .select('member_name, member_email, member_contact, role')
          .eq('team_id', currentTeam.id)
          .order('role', { ascending: false }) // captain comes first

        const memberCount = members?.length || 1
        const memberNames = members?.map(m => m.member_name) || [currentTeam.captain_name]

        // Generate event passes for ALL team members
        const attachments: Array<{
          filename: string;
          content: string;
          contentType: string;
        }> = []

        if (members && members.length > 0) {
          // Generate a pass for each team member
          for (let i = 0; i < members.length; i++) {
            const member = members[i]
            try {
              const passBase64 = await generateEventPassBase64({
                teamId: teamId,
                teamName: currentTeam.team_name,
                eventName: eventName,
                collegeName: currentTeam.college_name || 'N/A',
                captainName: member.member_name, // Use member's name for their pass
                captainEmail: member.member_email,
                captainPhone: member.member_contact,
                paymentStatus: 'PAID',
              })

              if (passBase64) {
                // Create a safe filename for the member
                const safeMemberName = member.member_name
                  .replace(/[^a-zA-Z0-9]/g, '-')
                  .replace(/-+/g, '-')
                  .slice(0, 20)
                
                attachments.push({
                  filename: `Gantavya-Pass-${safeMemberName}-${teamId}.jpg`,
                  content: passBase64,
                  contentType: 'image/jpeg',
                })
              }
            } catch (passError) {
              console.error(`Error generating pass for member ${member.member_name}:`, passError)
              // Continue with other members if one fails
            }
          }
        } else {
          // Fallback: generate just captain's pass if no members found
          try {
            const passBase64 = await generateEventPassBase64({
              teamId: teamId,
              teamName: currentTeam.team_name,
              eventName: eventName,
              collegeName: currentTeam.college_name || 'N/A',
              captainName: currentTeam.captain_name,
              captainEmail: currentTeam.captain_email,
              captainPhone: currentTeam.captain_phone,
              paymentStatus: 'PAID',
            })

            if (passBase64) {
              attachments.push({
                filename: `Gantavya-Pass-${teamId}.jpg`,
                content: passBase64,
                contentType: 'image/jpeg',
              })
            }
          } catch (passError) {
            console.error('Error generating event pass:', passError)
          }
        }

        console.log(`Generated ${attachments.length} passes for team ${teamId}`)
        
        const emailHtml = getRegistrationConfirmationEmail({
          teamName: currentTeam.team_name,
          captainName: currentTeam.captain_name,
          eventName: eventName,
          teamId: teamId,
          collegeName: currentTeam.college_name,
          memberCount: memberCount,
          transactionId: currentTeam.transaction_id,
          memberNames: memberNames,
        })

        const emailResult = await sendEmail({
          to: currentTeam.captain_email,
          subject: `🎉 Payment Verified - ${eventName} | Gantavya 2026`,
          html: emailHtml,
          attachments: attachments.length > 0 ? attachments : undefined,
        })

        if (!emailResult.success) {
          console.error(`Failed to send email to ${currentTeam.captain_email}:`, emailResult.error)
        } else {
          console.log(`Confirmation email with ${attachments.length} passes sent to ${currentTeam.captain_email}`)
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Don't fail the request if email fails - team is already updated
      }
    }

    return NextResponse.json({ 
      team,
      emailSent: wasUnpaid && isBeingVerified
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
