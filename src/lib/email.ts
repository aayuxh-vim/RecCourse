import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface BroadcastEmailParams {
  recipientEmails: string[];
  courseName: string;
  broadcastTitle: string;
  broadcastContent: string;
  broadcastType: string;
  facultyName: string;
}

export async function sendBroadcastNotification({
  recipientEmails,
  courseName,
  broadcastTitle,
  broadcastContent,
  broadcastType,
  facultyName,
}: BroadcastEmailParams): Promise<void> {
  if (!resend) {
    console.log(
      'Resend not configured. Skipping email for broadcast:',
      broadcastTitle
    );
    return;
  }

  if (recipientEmails.length === 0) return;

  const typeLabel =
    broadcastType === 'ANNOUNCEMENT'
      ? 'Announcement'
      : broadcastType === 'MATERIAL'
      ? 'New Material'
      : 'Assignment';

  const htmlContent = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e2e8f0; padding: 32px; border-radius: 12px;">
      <div style="border-bottom: 1px solid rgba(124, 58, 237, 0.3); padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff;">RecCourse</h1>
      </div>
      <div style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed;">${typeLabel}</span>
        <h2 style="margin: 8px 0 4px; font-size: 18px; color: #ffffff;">${broadcastTitle}</h2>
        <p style="margin: 0; font-size: 13px; color: #94a3b8;">${courseName} / ${facultyName}</p>
      </div>
      <div style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        ${broadcastContent.replace(/\n/g, '<br>')}
      </div>
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(124, 58, 237, 0.2); font-size: 12px; color: #64748b;">
        You received this email because you are enrolled in ${courseName} on RecCourse.
      </div>
    </div>
  `;

  try {
    // Send in batches of 50
    const batchSize = 50;
    for (let i = 0; i < recipientEmails.length; i += batchSize) {
      const batch = recipientEmails.slice(i, i + batchSize);
      await resend.emails.send({
        from: 'RecCourse <notifications@reccourse.dev>',
        to: batch,
        subject: `[${courseName}] ${typeLabel}: ${broadcastTitle}`,
        html: htmlContent,
      });
    }
  } catch (error) {
    console.error('Failed to send broadcast email:', error);
  }
}
