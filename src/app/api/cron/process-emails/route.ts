import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

// GET /api/cron/process-emails - External cron job endpoint
export async function GET(request: NextRequest) {
  console.log('🔄 External cron: Processing pending emails...')

  try {
    const supabase = createServiceClient()

    // Get pending jobs that are scheduled to run now
    const { data: jobs, error: fetchError } = await supabase
      .from('email_jobs')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5) // Process up to 5 jobs per cron run

    if (fetchError) {
      console.error('❌ Error fetching jobs:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    if (!jobs || jobs.length === 0) {
      console.log('ℹ️ No pending jobs to process')
      return NextResponse.json({
        message: 'No jobs to process',
        processed: 0,
        timestamp: new Date().toISOString()
      })
    }

    console.log(`📋 Found ${jobs.length} jobs to process`)

    let processed = 0
    let failed = 0

    for (const job of jobs) {
      try {
        // Mark job as processing
        await supabase
          .from('email_jobs')
          .update({
            status: 'processing',
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id)

        console.log(`🔄 Processing job ${job.id} (${job.job_type})`)

        if (job.job_type === 'send_pass_email') {
          await processPassEmailJob(job)
        } else {
          throw new Error(`Unknown job type: ${job.job_type}`)
        }

        // Mark job as completed
        await supabase
          .from('email_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id)

        processed++
        console.log(`✅ Job ${job.id} completed successfully`)

      } catch (jobError) {
        console.error(`❌ Job ${job.id} failed:`, jobError)

        const newRetryCount = job.retry_count + 1
        const shouldRetry = newRetryCount < job.max_retries

        await supabase
          .from('email_jobs')
          .update({
            status: shouldRetry ? 'pending' : 'failed',
            error_message: jobError instanceof Error ? jobError.message : 'Unknown error',
            retry_count: newRetryCount,
            updated_at: new Date().toISOString(),
            // Schedule retry with exponential backoff (5, 15, 45 minutes)
            scheduled_at: shouldRetry
              ? new Date(Date.now() + (5 * 60 * 1000 * Math.pow(3, newRetryCount - 1))).toISOString()
              : job.scheduled_at
          })
          .eq('id', job.id)

        failed++
      }
    }

    console.log(`🎉 Cron job completed. Processed: ${processed}, Failed: ${failed}`)

    return NextResponse.json({
      message: `Processed ${processed} jobs, ${failed} failed`,
      processed,
      failed,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error', timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}

async function processPassEmailJob(job: any) {
  const emailData = job.data

  // Validate required fields
  if (!emailData.to || !emailData.subject || !emailData.html) {
    throw new Error('Missing required email fields')
  }

  // Send the email
  const emailResult = await sendEmail({
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html,
  })

  if (!emailResult.success) {
    throw new Error(`Email sending failed: ${emailResult.error}`)
  }

  console.log(`📬 Email sent successfully to ${emailData.to}`)
}