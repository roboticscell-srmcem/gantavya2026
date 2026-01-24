import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { memberId, isPresent } = await request.json()

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Update attendance
    const { error } = await supabase
      .from('team_members')
      .update({
        is_present: isPresent,
        attendance_marked_at: new Date().toISOString(),
        // TODO: Add admin user ID when authentication is implemented
        // attendance_marked_by: adminUserId
      })
      .eq('id', memberId)

    if (error) {
      console.error('Attendance update error:', error)
      return NextResponse.json(
        { error: 'Failed to update attendance' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Attendance updated successfully'
    })

  } catch (error) {
    console.error('Scan API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}