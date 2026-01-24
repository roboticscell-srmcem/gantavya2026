import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateEventPass } from '@/lib/pass-generator'
import { sendEmail } from '@/lib/email'
import { getRegistrationConfirmationEmail } from '@/lib/email/templates/payment-verified'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path'

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}

console.log('🔧 Cloudinary config check:', {
  hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
  hasApiKey: !!process.env.CLOUDINARY_API_KEY,
  hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
  cloudNameLength: process.env.CLOUDINARY_CLOUD_NAME?.length || 0,
})

cloudinary.config(cloudinaryConfig)

// POST /api/generate-passes - Generate passes for paid teams and send emails
export async function POST(request: NextRequest) {
  console.log('🚀 Starting pass generation process')
  try {
    const supabase = createServiceClient()

    // Get all teams that have paid but passes not yet generated
    console.log('📋 Fetching teams that have paid but passes not generated')
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        events (
          name,
          slug,
          start_time,
          venue
        ),
        team_members (
          id,
          member_name,
          member_email,
          member_contact,
          role
        )
      `)
      .eq('has_paid', true)
      .eq('passes_generated', false)
      .limit(10) // Process in batches to avoid timeouts

    if (error) {
      console.error('❌ Error fetching teams:', error)
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      )
    }

    if (!teams || teams.length === 0) {
      console.log('ℹ️ No teams to process')
      return NextResponse.json({ message: 'No teams to process' })
    }

    console.log(`📊 Found ${teams.length} teams to process`)

    const processedTeams: any[] = []

    for (const team of teams) {
      console.log(`🏁 Processing team: ${team.team_name} (${team.id})`)
      try {
        const eventName = team.events?.name || 'Gantavya Event'
        const teamId = team.team_code || team.id.slice(0, 8).toUpperCase()

        // Get team members
        const members = team.team_members || []
        const memberCount = members.length || 1
        const memberNames = members.map((m: any) => m.member_name) || [team.captain_name]

        // Generate passes and upload to Cloudinary
        const passUrls: { memberId: string; name: string; email: string; url: string }[] = []

        if (members.length > 0) {
          console.log(`👥 Processing ${members.length} team members`)
          for (const member of members) {
            console.log(`🎫 Generating pass for: ${member.member_name} (${member.member_email})`)
            try {
              // Define safe member name first
              const safeMemberName = member.member_name
                .replace(/[^a-zA-Z0-9]/g, '-')
                .replace(/-+/g, '-')
                .slice(0, 20)

              const passBuffer = await generateEventPass({
                teamId: teamId,
                teamName: team.team_name,
                eventName: eventName,
                collegeName: team.college_name || 'N/A',
                participantName: member.member_name,
                participantEmail: member.member_email,
                participantPhone: member.member_contact,
                paymentStatus: 'PAID',
              })

              // Save locally in IDs folder
              const idsFolder = path.join(process.cwd(), 'IDs')
              if (!fs.existsSync(idsFolder)) {
                fs.mkdirSync(idsFolder, { recursive: true })
              }
              const localFileName = `Gantavya-Pass-${safeMemberName}-${teamId}.jpg`
              const localPath = path.join(idsFolder, localFileName)
              fs.writeFileSync(localPath, passBuffer)
              console.log(`💾 Saved pass locally: ${localPath}`)

              // Upload to Cloudinary
              console.log(`☁️ Uploading to Cloudinary: IDs/${safeMemberName}-${teamId}`)
              let passUrl: string
              const isCloudinaryConfigured = cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret
              console.log('🔍 Cloudinary configured:', isCloudinaryConfigured)
              
              if (!isCloudinaryConfigured) {
                console.log('⚠️ Cloudinary not configured, using data URL')
                passUrl = `data:image/jpeg;base64,${passBuffer.toString('base64')}`
              } else {
                const uploadResult = await new Promise((resolve, reject) => {
                  const stream = cloudinary.uploader.upload_stream(
                    {
                      folder: 'IDs',
                      public_id: `Gantavya-Pass-${safeMemberName}-${teamId}`,
                      format: 'jpg',
                      resource_type: 'image',
                    },
                    (error, result) => {
                      if (error) reject(error)
                      else resolve(result)
                    }
                  )
                  stream.end(passBuffer)
                })

                passUrl = (uploadResult as any).secure_url
                console.log(`✅ Uploaded to Cloudinary: ${passUrl}`)
              }

              passUrls.push({
                memberId: member.id,
                name: member.member_name,
                email: member.member_email,
                url: passUrl,
              })

              // Update team_member with pass_url (only if not data URL)
              if (!passUrl.startsWith('data:')) {
                await supabase
                  .from('team_members')
                  .update({ pass_url: passUrl })
                  .eq('id', member.id)
                console.log(`🗄️ Updated database for member: ${member.member_name}`)
              }

            } catch (passError) {
              console.error(`Failed to generate pass for ${member.member_name}:`, passError)
            }
          }
        } else {
          console.log(`👤 Processing captain only: ${team.captain_name}`)
          // Fallback for captain only
          try {
            const passBuffer = await generateEventPass({
              teamId: teamId,
              teamName: team.team_name,
              eventName: eventName,
              collegeName: team.college_name || 'N/A',
              participantName: team.captain_name,
              participantEmail: team.captain_email,
              participantPhone: team.captain_phone || '',
              paymentStatus: 'PAID',
            })

            // Save locally in IDs folder
            const idsFolder = path.join(process.cwd(), 'IDs')
            if (!fs.existsSync(idsFolder)) {
              fs.mkdirSync(idsFolder, { recursive: true })
            }
            const localFileName = `Gantavya-Pass-${teamId}.jpg`
            const localPath = path.join(idsFolder, localFileName)
            fs.writeFileSync(localPath, passBuffer)
            console.log(`💾 Saved captain pass locally: ${localPath}`)

            let passUrl: string
            const isCloudinaryConfiguredCaptain = cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret
            console.log('🔍 Cloudinary configured for captain:', isCloudinaryConfiguredCaptain)
            
            if (!isCloudinaryConfiguredCaptain) {
              console.log('⚠️ Cloudinary not configured, using data URL for captain')
              passUrl = `data:image/jpeg;base64,${passBuffer.toString('base64')}`
            } else {
              const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  {
                    folder: 'IDs',
                    public_id: `Gantavya-Pass-${teamId}`,
                    format: 'jpg',
                    resource_type: 'image',
                  },
                  (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                  }
                )
                stream.end(passBuffer)
              })

              passUrl = (uploadResult as any).secure_url
              console.log(`✅ Uploaded captain pass to Cloudinary: ${passUrl}`)
            }

            passUrls.push({
              memberId: team.captain_id || team.id,
              name: team.captain_name,
              email: team.captain_email,
              url: passUrl,
            })
          } catch (passError) {
            console.error(`Failed to generate captain pass for team ${teamId}:`, passError)
          }
        }

        // Schedule emails with 10-15 minute delay using job queue
        const delayMinutes = Math.random() * 5 + 10 // Random delay between 10-15 minutes
        const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000)
        console.log(`⏳ Scheduling emails to be sent at ${scheduledAt.toISOString()} (${delayMinutes.toFixed(1)} minutes from now)`)

        // Create email jobs for each pass
        const jobInserts = []
        for (const pass of passUrls) {
          const emailHtml = getRegistrationConfirmationEmail({
            teamName: team.team_name,
            captainName: team.captain_name,
            eventName,
            teamId,
            collegeName: team.college_name,
            memberCount,
            transactionId: team.transaction_id,
            memberNames: [...memberNames],
            passUrls: [pass.url],
            participantName: pass.name,
          })

          jobInserts.push({
            job_type: 'send_pass_email',
            status: 'pending',
            priority: 1,
            data: {
              to: pass.email,
              subject: `🎉 Your Event Pass Ready - ${eventName} | Gantavya 2026`,
              html: emailHtml,
            },
            scheduled_at: scheduledAt.toISOString(),
          })
        }

        // Insert all jobs at once
        const { error: jobError } = await supabase
          .from('email_jobs')
          .insert(jobInserts)

        if (jobError) {
          console.error('❌ Failed to create email jobs:', jobError)
          throw new Error('Failed to schedule emails')
        }

        console.log(`📧 Created ${jobInserts.length} email jobs for team ${team.team_name}`)

        // Mark as processed immediately after generation
        await supabase
          .from('teams')
          .update({ passes_generated: true })
          .eq('id', team.id)
        console.log(`✅ Marked team ${team.team_name} as processed (emails scheduled)`)

        processedTeams.push({
          teamId: team.id,
          teamName: team.team_name,
          passCount: passUrls.length,
          emailsScheduled: true,
          delayMinutes: delayMinutes.toFixed(1),
        })

      } catch (teamError) {
        console.error(`❌ Error processing team ${team.id}:`, teamError)
      }
    }

    console.log(`🎉 Pass generation completed. Processed ${processedTeams.length} teams (emails scheduled with delay)`)
    
    return NextResponse.json({
      message: `Processed ${processedTeams.length} teams - passes generated and emails scheduled`,
      processedTeams,
    })

  } catch (error) {
    console.error('💥 Generate passes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
