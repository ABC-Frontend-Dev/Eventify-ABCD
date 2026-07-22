// lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function sendOTPEmail(email: string, otp: string) {
    try {
        await transporter.sendMail({
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: "Your OTP for Password Reset - Eventify",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Your OTP for password reset is:</p>
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h1 style="color: #000; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p style="color: #666;">This OTP is valid for 5 minutes only.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return false;
    }
}

interface ContactEmailData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

export async function sendContactFormNotificationEmail(contactData: ContactEmailData, recipientEmails: string[]) {
    try {
        // Filter out empty emails and remove duplicates
        const validEmails = [...new Set(recipientEmails.filter((email) => email && email.trim()).map((email) => email.trim().toLowerCase()))];

        if (validEmails.length === 0) {
            console.warn("⚠️ No valid recipient emails provided");
            return false;
        }

        // HTML email template for admin notification
        const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F8FAFC;">

    <!-- Preheader (hidden, shows in inbox preview) -->
    <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
        New contact form submission from ${contactData.name}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; border-collapse: collapse;">

        <!-- Header -->
        <tr>
            <td style="background-color: #7E0ACB; padding: 32px 32px 28px 32px; border-radius: 10px 10px 0 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <div style="display: inline-block;"><img src="https://res.cloudinary.com/afdhm38k/image/upload/v1784724836/logo-light-1_1_uvye8a.png" alt="Girl in a jacket" width="100%" height="220px"></div>
                            <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em;">New Contact Form Submission</h1>
                            <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.75);">Eventify Contact Management</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="background-color: #ffffff; padding: 32px; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">

                <!-- Details card -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td style="padding: 20px 20px 16px 20px; border-bottom: 1px solid #E2E8F0;">
                            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #7E0ACB;">Name</p>
                            <p style="margin: 0; font-size: 15px; color: #1E293B;">${contactData.name}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 20px; border-bottom: 1px solid #E2E8F0;">
                            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #7E0ACB;">Email</p>
                            <p style="margin: 0; font-size: 15px;">
                                <a href="mailto:${contactData.email}" style="color: #7E0ACB; text-decoration: none;">${contactData.email}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 20px; border-bottom: 1px solid #E2E8F0;">
                            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #7E0ACB;">Phone</p>
                            <p style="margin: 0; font-size: 15px;">
                                <a href="tel:${contactData.phone}" style="color: #7E0ACB; text-decoration: none;">${contactData.phone}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 20px 20px 20px;">
                            <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #7E0ACB;">Message</p>
                            <div style="background-color: #F1F5F9; padding: 14px 16px; border-radius: 6px; border-left: 3px solid #7E0ACB; color: #1E293B; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">${contactData.message}</div>
                        </td>
                    </tr>
                </table>

                <!-- Timestamp -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                    <tr>
                        <td style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px 16px;">
                            <p style="margin: 0; font-size: 13px; color: #475569;">
                                <strong style="color: #1E293B;">Submitted:</strong>
                                ${new Date().toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    timeZoneName: "short",
                                })}
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- CTA -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                    <tr>
                        <td align="center">
                            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/contacts"
                               style="display: inline-block; background-color: #7E0ACB; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                                View in Dashboard
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #272727; padding: 20px 32px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #94A3B8;">Eventify &copy; ${new Date().getFullYear()} &middot; All rights reserved</p>
                <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748B;">This is an automated notification — please do not reply to this email.</p>
            </td>
        </tr>

    </table>
</div>
        `;

        // Send email to all recipient emails
        const emailPromises = validEmails.map((email) =>
            transporter
                .sendMail({
                    from: `"${process.env.EMAIL_FROM_NAME || "Eventify"}" <${process.env.GMAIL_EMAIL}>`,
                    to: email,
                    subject: `New Contact Form Submission - ${contactData.name}`,
                    html,
                })
                .catch((error) => {
                    console.error(`Failed to send email to ${email}:`, error);
                    return null;
                }),
        );

        const results = await Promise.all(emailPromises);
        const successCount = results.filter((r) => r !== null).length;

        if (successCount > 0) {
            console.log(`✅ Contact form notification sent to ${successCount} recipient(s)`);
            return true;
        }

        return false;
    } catch (error) {
        console.error("❌ Error sending contact form notification email:", error);
        return false;
    }
}

export async function sendContactConfirmationEmail(email: string, name: string) {
    try {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white;">
                    <h2 style="margin: 0; font-size: 24px;">✅ We Received Your Message</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Thank you for contacting Eventify</p>
                </div>

                <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
                    <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                        <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Hi <strong>${name}</strong>,</p>
                        
                        <p style="margin: 0 0 15px 0; color: #666; line-height: 1.6;">
                            Thank you for reaching out to us! We've received your message and will get back to you as soon as possible.
                        </p>

                        <p style="margin: 0 0 15px 0; color: #666; line-height: 1.6;">
                            Our team typically responds within 24 hours during business days.
                        </p>

                        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0;">
                            <p style="margin: 0; color: #333; font-size: 14px;">
                                <strong>Reference ID:</strong> ${Math.random().toString(36).substr(2, 9).toUpperCase()}
                            </p>
                        </div>

                        <p style="margin: 15px 0 0 0; color: #999; font-size: 13px;">
                            If you have any urgent matters, feel free to contact us directly.
                        </p>
                    </div>
                </div>

                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    <p style="margin: 0;">Eventify © ${new Date().getFullYear()} | All rights reserved</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || "Eventify"}" <${process.env.GMAIL_EMAIL}>`,
            to: email,
            subject: "We Received Your Message - Eventify",
            html,
        });

        console.log(`✅ Confirmation email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("❌ Error sending confirmation email:", error);
        return false;
    }
}
