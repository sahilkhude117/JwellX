import { resend } from "./resend";

export async function sendVerificationEmail(
    email: string,
    name: string,
    token: string
) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'JwellX <noreply@jwellx.com>',
            to: email,
            subject: "Verify your JwellX Account",
            html: `
                <!DOCTYPE html>
                <html>
                    <head>
                    <meta charset="utf-8">
                        <title>Verify your JwellX account</title>
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
                    </style>
                    </head>
                    <body>
                    <div class="header">
                        <div class="logo">💎 JwellX</div>
                    </div>
                    
                    <div class="content">
                        <h2>Welcome to JwellX, ${name}!</h2>
                        <p>Thank you for creating your jewelry store account. To complete your registration and start using JwellX, please verify your email address.</p>
                        
                        <div style="text-align: center;">
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </div>
                        
                        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                        
                        <p>This verification link will expire in 24 hours for security reasons.</p>
                    </div>
                    
                    <div class="footer">
                        <p>If you didn't create this account, you can safely ignore this email.</p>
                        <p>© 2025 JwellX. All rights reserved.</p>
                    </div>
                    </body>
                </html>
            `
        });
    } catch (error) {
        console.error("Failed to send verification email:", error);
        throw new Error("Failed to send verification email");
    }
}