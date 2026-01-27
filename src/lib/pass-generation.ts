// filepath: src/lib/pass-generation.ts
import { createServiceClient } from '@/lib/supabase/server'
import { generateEventPass } from '@/lib/pass-generator'
import { sendEmail } from '@/lib/email'
import { getRegistrationConfirmationEmail } from '@/lib/email/templates/payment-verified'
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}
cloudinary.config(cloudinaryConfig)

export async function generatePassesForTeam(teamId: string) {
  const supabase = createServiceClient()

  // Fetch the team with members
  const { data: team, error } = await supabase
    .from('teams')
    .select(`
      *,
      events (name, slug, start_time, venue),
      team_members (id, member_name, member_email, member_contact, role)
    `)
    .eq('id', teamId)
    .single()

  if (error || !team) {
    throw new Error(`Team not found: ${teamId}`)
  }

  console.log(`Generating passes for team: ${team.team_name}`)
  console.time('Total Pass Generation')

  // Generate and upload passes for each member in parallel
  const passPromises = team.team_members.map(async (member: any) => {
    console.log(`🎫 Generating pass for: ${member.member_name} (${member.member_email})`)
    try {
      const safeMemberName = member.member_name
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 20)

      const passBuffer = await generateEventPass({
        teamId: team.team_code || team.id.slice(0, 8).toUpperCase(),
        teamName: team.team_name,
        eventName: team.events?.name || 'Gantavya Event',
        collegeName: team.college_name || 'N/A',
        participantName: member.member_name,
        participantEmail: member.member_email,
        participantPhone: member.member_contact,
        paymentStatus: 'PAID',
      })

      // Upload to Cloudinary
      console.log(`☁️ Uploading to Cloudinary: IDs/${safeMemberName}-${teamId}`)
      const isCloudinaryConfigured = cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret
      let passUrl: string

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

      // Update team_member with pass_url
      if (!passUrl.startsWith('data:')) {
        await supabase
          .from('team_members')
          .update({ pass_url: passUrl })
          .eq('id', member.id)
      }

      return {
        memberId: member.id,
        name: member.member_name,
        email: member.member_email,
        url: passUrl,
      }
    } catch (passError) {
      console.error(`Failed to generate pass for ${member.member_name}:`, passError)
      return null // Or handle errors differently
    }
  })

  const passUrls = (await Promise.all(passPromises)).filter(Boolean) as { memberId: string; name: string; email: string; url: string }[]

  console.timeEnd('Total Pass Generation')

  // Send email with all passes to the captain
  console.log(`📧 Sending email with all passes to captain: ${team.captain_email}`)

  const emailHtml = getRegistrationConfirmationEmail({
    teamName: team.team_name,
    captainName: team.captain_name,
    eventName: team.events?.name || 'Gantavya Event',
    teamId: team.team_code || team.id.slice(0, 8).toUpperCase(),
    collegeName: team.college_name,
    memberCount: team.team_members.length,
    transactionId: team.transaction_id,
    memberNames: team.team_members.map((m: any) => m.member_name),
    passUrls: passUrls.map(p => ({ name: p.name, url: p.url })),
    participantName: team.captain_name,
  })

  const emailResult = await sendEmail({
    to: team.captain_email,
    subject: `🎉 Event Passes Ready - ${team.events?.name || 'Gantavya Event'} | Gantavya 2026`,
    html: emailHtml,
  })

  if (emailResult.success) {
    console.log(`📬 Email sent successfully to captain: ${team.captain_email}`)
  } else {
    console.error(`❌ Failed to send email to captain: ${team.captain_email}`)
  }

  // Mark as processed
  await supabase
    .from('teams')
    .update({ passes_generated: true })
    .eq('id', teamId)

  console.log(`✅ Passes generated and emails sent for team: ${team.team_name}`)
  return { success: true, passUrls }
}