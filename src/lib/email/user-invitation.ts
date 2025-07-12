// lib/email/user-invitation.ts
import { resend } from './resend';
import { render } from '@react-email/render';
import { UserInvitationEmail } from '@/components/emails/user-invitation';

export interface SendInvitationEmailParams {
  email: string;
  name: string;
  tempPassword?: string;
  shopName: string;
  inviterName: string;
  verificationToken?: string;
}

export async function sendInvitationEmail({
  email,
  name,
  tempPassword,
  shopName,
  inviterName,
  verificationToken,
}: SendInvitationEmailParams) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin`;
  const verificationUrl = verificationToken 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`
    : undefined;

  const emailHtml = await render(
    UserInvitationEmail({
      userName: name,
      inviterName,
      shopName,
      loginUrl,
      verificationUrl,
      tempPassword,
    })
  );

  const emailText = `
Hi ${name},

${inviterName} has invited you to join ${shopName} on our jewelry management system.

${tempPassword ? `Your temporary password is: ${tempPassword}` : ''}

${verificationUrl ? `Please verify your email first: ${verificationUrl}` : ''}

You can log in at: ${loginUrl}

Welcome to the team!

Best regards,
${shopName} Team
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: [email],
      subject: `Welcome to ${shopName} - Account Invitation`,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      throw new Error('Failed to send invitation email');
    }

    console.log('Invitation email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}

