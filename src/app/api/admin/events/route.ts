import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET all events (admin only - using service client to bypass RLS)
export async function GET() {
  try {
    const supabase = createServiceClient()
    
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    return NextResponse.json({ events })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST new event (admin only)
export async function POST(request: Request) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    
    // Extract rules from body
    const { rules, ...eventData } = body

    const { data: event, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create event', details: error.message },
        { status: 500 }
      )
    }

    // Insert rules if provided
    if (rules && rules.length > 0) {
      const rulesData = rules.map((rule: string) => ({
        event_id: event.id,
        rule_text: rule,
      }))

      const { error: rulesError } = await supabase
        .from('event_rules')
        .insert(rulesData)

      if (rulesError) {
        // Don't fail the whole request, just skip rules
      }
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
