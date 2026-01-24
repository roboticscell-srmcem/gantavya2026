/**
 * Registration Received Email Template
 * Clean, minimal design - sent after form submission
 */

import { BRAND_CONFIG } from '../config';

export interface RegistrationReceivedData {
  teamName: string;
  captainName: string;
  eventName: string;
  teamId: string;
  collegeName?: string;
  memberCount?: number;
  transactionId?: string;
  totalAmount?: number;
}

export function getRegistrationReceivedEmail(data: RegistrationReceivedData): string {
  const { teamName, captainName, eventName, teamId, collegeName, memberCount, transactionId, totalAmount } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid #e5e5e5;">
              <h1 style="margin: 0 0 4px; font-size: 24px; font-weight: 600; color: #111;">Registration Received</h1>
              <p style="margin: 0; font-size: 14px; color: #666;">${BRAND_CONFIG.name}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 24px 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #333; line-height: 1.5;">
                Hi ${captainName}, we've received your registration for <strong>${eventName}</strong>.
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #333; line-height: 1.5;">
                Your payment is <span style="color: #b45309; font-weight: 500;">under verification</span>. You'll receive confirmation with event passes once verified.
              </p>
              
              <!-- Details Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5;">
                    <span style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Team ID</span>
                    <div style="font-size: 16px; font-weight: 600; color: #111; margin-top: 2px; font-family: monospace;">${teamId}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5;">
                    <span style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Team</span>
                    <div style="font-size: 15px; color: #111; margin-top: 2px;">${teamName}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5;">
                    <span style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Event</span>
                    <div style="font-size: 15px; color: #111; margin-top: 2px;">${eventName}</div>
                  </td>
                </tr>
                ${collegeName ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5;">
                    <span style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">College</span>
                    <div style="font-size: 15px; color: #111; margin-top: 2px;">${collegeName}</div>
                  </td>
                </tr>
                ` : ''}
                ${memberCount ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5;">
                    <span style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Team Size</span>
                    <div style="font-size: 15px; color: #111; margin-top: 2px;">${memberCount} member${memberCount > 1 ? 's' : ''}</div>
                  </td>
                </tr>
                ` : ''}
                ${transactionId ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5;">
                    <span style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Transaction ID</span>
                    <div style="font-size: 14px; color: #111; margin-top: 2px; font-family: monospace;">${transactionId}</div>
                  </td>
                </tr>
                ` : ''}
                ${totalAmount ? `
                <tr>
                  <td style="padding: 12px 16px;">
                    <span style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Amount Paid</span>
                    <div style="font-size: 15px; font-weight: 600; color: #111; margin-top: 2px;">₹${totalAmount}</div>
                  </td>
                </tr>
                ` : ''}
              </table>
              
              <!-- Next Steps -->
              <div style="margin-top: 24px;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 500; color: #333;">Next Steps:</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #555; line-height: 1.8;">
                  <li>Payment verification within 24-48 hours</li>
                  <li>Confirmation email with event passes</li>
                  <li>Event date: ${BRAND_CONFIG.eventDates}</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 13px; color: #666;">
                Questions? <a href="mailto:${BRAND_CONFIG.supportEmail}" style="color: #2563eb; text-decoration: none;">${BRAND_CONFIG.supportEmail}</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
