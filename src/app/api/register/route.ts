import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const registrationData = await request.json();

    // Log registration data (in production, save to database)
    console.log('New Registration:', registrationData);

    // Here you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Generate lanyard/ticket
    // 4. Integrate with payment gateway webhook
    // 5. Send to external webhook if needed

    // Simulate webhook processing
    const webhookResponse = {
      success: true,
      registrationId: `REG${Date.now()}`,
      transactionId: registrationData.payment.transactionId,
      message: 'Registration successful',
      lanyard: {
        url: `/lanyard/${registrationData.payment.transactionId}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${registrationData.payment.transactionId}`
      }
    };

    // Send email notification (pseudo-code)
    // await sendConfirmationEmail(registrationData);

    return NextResponse.json(webhookResponse, { status: 200 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
