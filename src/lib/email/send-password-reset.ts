// lib/email/send-password-reset.ts
import { resend } from "./resend";

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "JwellX <noreply@jwellx.com>",
      to: email,
      subject: "Reset your JwellX password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset your JwellX password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #eee;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #000;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #000;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              text-align: center;
              margin: 20px 0;
            }
            .footer {
              border-top: 1px solid #eee;
              padding-top: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 12px;
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">💎 JwellX</div>
          </div>
          
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your JwellX account password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            
            <div class="warning">
              <strong>Security Notice:</strong> This password reset link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.
            </div>
          </div>
          
          <div class="footer">
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p>For security questions, contact our support team.</p>
            <p>© 2025 JwellX. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}