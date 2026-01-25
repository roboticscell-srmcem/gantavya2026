/**
 * Payment Verified Email Template
 * Clean, minimal design - sent after payment verification
 */

import { BRAND_CONFIG } from '../config';

export interface PaymentVerifiedData {
  teamName: string;
  captainName: string;
  eventName: string;
  teamId: string;
  collegeName?: string;
  memberCount?: number;
  transactionId?: string;
  memberNames?: string[];
  passUrls?: { name: string; url: string }[];
  participantName?: string; // For individual emails
}

export function getRegistrationConfirmationEmail(data: PaymentVerifiedData): string {
  const { teamName, captainName, eventName, teamId, collegeName, memberCount, transactionId, memberNames, passUrls, participantName } = data;

  // Use participantName if provided (for individual emails), otherwise captainName
  const recipientName = participantName || captainName;

  // Build member list for passes
  const memberList = memberNames && memberNames.length > 0 
    ? memberNames.map((name, i) => `<li>${name}${i === 0 ? ' (Captain)' : ''}</li>`).join('')
    : '';

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
              <h1 style="margin: 0 0 4px; font-size: 24px; font-weight: 600; color: #111;">Payment Verified ✓</h1>
              <p style="margin: 0; font-size: 14px; color: #666;">${BRAND_CONFIG.name}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 24px 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #333; line-height: 1.5;">
                Hi ${recipientName}, your payment has been <span style="color: #16a34a; font-weight: 500;">verified</span>.
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #333; line-height: 1.5;">
                ${participantName ? 'Your event pass is ready!' : 'Your team is now registered for'} <strong>${eventName}</strong>${participantName ? '' : '. Event passes for all team members are ready'}.
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
                  <td style="padding: 12px 16px;">
                    <span style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Transaction ID</span>
                    <div style="font-size: 14px; color: #111; margin-top: 2px; font-family: monospace;">${transactionId}</div>
                  </td>
                </tr>
                ` : ''}
              </table>
              
              <!-- Passes Links -->
              ${passUrls && passUrls.length > 0 ? `
              <div style="margin-top: 24px; padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 500; color: #166534;">🎟️ Event Passes:</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #15803d; line-height: 1.6;">
                  ${passUrls.map((pass) => `<li><strong>${pass.name}'s Event Pass:</strong> <a href="${pass.url}" style="color: #15803d; text-decoration: underline;">Download</a></li>`).join('')}
                </ul>
              </div>
              ` : memberList ? `
              <div style="margin-top: 24px; padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 500; color: #166534;">🎟️ Passes attached for:</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #15803d; line-height: 1.6;">
                  ${memberList}
                </ul>
              </div>
              ` : ''}
              
              <!-- What to do -->
              <div style="margin-top: 24px;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 500; color: #333;">Before the event:</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #555; line-height: 1.8;">
                  <li>Share passes with your team members</li>
                  <li>Bring passes (print or digital) for check-in</li>
                  <li>Review event rules and guidelines</li>
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
