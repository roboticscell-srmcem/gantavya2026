import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'
import { z } from 'zod'

const orderSchema = z.object({
  team_id: z.string().uuid('Invalid team ID'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = orderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { team_id } = validation.data

    const supabase = createServiceClient()

    // 1. Fetch team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, total_amount_payable, currency, has_paid, payment_order_id, team_name, captain_email')
      .eq('id', team_id)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // 2. Check if already paid
    if (team.has_paid) {
      return NextResponse.json(
        { error: 'Payment already completed for this team' },
        { status: 400 }
      )
    }

    // 3. Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    // 4. Create Razorpay order
    const options = {
      amount: Math.round(team.total_amount_payable * 100), // Convert to paise
      currency: team.currency,
      receipt: `receipt_${team.id}`,
      notes: {
        team_id: team.id,
        team_name: team.team_name,
        captain_email: team.captain_email,
      },
    }

    const razorpayOrder = await razorpay.orders.create(options)

    // 5. Update team with payment_order_id
    const { error: updateError } = await supabase
      .from('teams')
      .update({
        payment_order_id: razorpayOrder.id,
        payment_status: 'created',
      })
      .eq('id', team.id)

    if (updateError) {
      console.error('Error updating team with order ID:', updateError)
      return NextResponse.json(
        { error: 'Failed to update payment order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
