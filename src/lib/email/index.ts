/**
 * Email Service
 * 
 * This service handles sending emails using the Resend SDK.
 * Email templates are stored in the templates/ folder for easy maintenance.
 * 
 * Setup:
 * 1. Sign up at https://resend.com
 * 2. Add environment variables:
 *    - RESEND_API_KEY
 *    - RESEND_DOMAIN (your verified domain)
 *    - EMAIL_FROM_ADDRESS
 *    - EMAIL_FROM_NAME
 * 
 * Template Structure:
 * - templates/registration-received.ts - Sent on form submission
 * - templates/payment-verified.ts - Sent after payment verification
 * - templates/index.ts - Barrel export for all templates
 */

import { Resend } from 'resend';
import { BRAND_CONFIG } from './config';

// Re-export templates
export { 
  getRegistrationReceivedEmail,
  getRegistrationConfirmationEmail,
} from './templates';

// Re-export config
export { BRAND_CONFIG } from './config';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface EmailAttachment {
  filename: string;
  content: Buffer | string; // Buffer or Base64 encoded content
  contentType?: string;
}

/**
 * Send an email with HTML content and optional attachments
 */
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<EmailResponse> {
  const { to, subject, html, attachments } = options;

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  const fromAddress = process.env.EMAIL_FROM_ADDRESS;
  const fromName = process.env.EMAIL_FROM_NAME || BRAND_CONFIG.name;

  try {
    // Prepare attachments for Resend SDK format
    const resendAttachments = attachments?.map((att) => {
      const buffer = typeof att.content === 'string' 
        ? Buffer.from(att.content, 'base64') 
        : att.content;
      return {
        filename: att.filename,
        content: buffer,
      };
    });

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      replyTo: BRAND_CONFIG.supportEmail,
      html,
      ...(resendAttachments && resendAttachments.length > 0 && { attachments: resendAttachments }),
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check if email service is properly configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
