// lib/email.ts
import nodemailer from "nodemailer";
import { getSiteUrl } from "@/lib/constants";
import { contactAutoReplyEmail } from "@/lib/email-templates/contact-auto-reply";
import { COLORS, SITE_URL, accent, button, callout, detailTable, emailLayout, escapeHtml, eyebrow, heading, paragraph } from "@/lib/email-templates/base-layout";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ── Password reset OTP ────────────────────────────────────────────────────────
export async function sendOTPEmail(email: string, otp: string) {
  try {
    const body = `
${eyebrow("Password reset")}
${heading(`Your verification ${accent("code")}`)}
${paragraph("Use the one-time code below to reset your Eventify dashboard password.")}

<div style="margin:8px 0 20px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.panel};border:1px solid ${COLORS.border};border-left:4px solid ${COLORS.purple};">
        <tr>
            <td align="center" style="padding:24px 16px;">
                <p style="margin:0;padding-left:10px;font-family:'Courier New', Courier, monospace;font-size:34px;line-height:40px;font-weight:bold;letter-spacing:10px;color:${COLORS.ink};">${escapeHtml(otp)}</p>
            </td>
        </tr>
    </table>
</div>

${callout("This code is valid for <strong>5 minutes</strong> only. Never share it with anyone.", "warning")}
${paragraph("If you didn&rsquo;t request a password reset, you can safely ignore this email &mdash; your password will not change.", { muted: true })}`;

    const html = emailLayout({
      title: "Password reset code",
      preheader: "Your Eventify password reset code. It is valid for 5 minutes.",
      body,
      variant: "internal",
      footerNote: "This is an automated message — please do not reply to this email.",
    });

    await transporter.sendMail({
      from: `"Eventify" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: "Your OTP for Password Reset - Eventify",
      html,
    });
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
}

// ── Contact form: notification to admins ──────────────────────────────────────
interface ContactEmailData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export async function sendContactFormNotificationEmail(
  contactData: ContactEmailData,
  recipientEmails: string[],
) {
  try {
    // Filter out empty emails and remove duplicates
    const validEmails = [
      ...new Set(
        recipientEmails
          .filter((email) => email && email.trim())
          .map((email) => email.trim().toLowerCase()),
      ),
    ];

    if (validEmails.length === 0) {
      console.warn("⚠️ No valid recipient emails provided");
      return false;
    }

    // Everything the visitor typed is escaped before it goes into the HTML.
    const safeName = escapeHtml(contactData.name);
    const safeEmail = escapeHtml(contactData.email);
    const safePhone = escapeHtml(contactData.phone);
    const phoneHref = escapeHtml(contactData.phone.replace(/[^\d+]/g, ""));

    const submittedAt = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });

    const body = `
${eyebrow("New enquiry")}
${heading(`New contact form ${accent("submission")}`)}
${paragraph(`<strong style="color:${COLORS.ink};">${safeName}</strong> has just submitted the contact form on the website.`)}

${detailTable([
  { label: "Name", value: safeName },
  { label: "Email", value: `<a href="mailto:${safeEmail}" style="color:${COLORS.purple};text-decoration:none;">${safeEmail}</a>` },
  { label: "Phone", value: `<a href="tel:${phoneHref}" style="color:${COLORS.purple};text-decoration:none;">${safePhone}</a>` },
  {
    label: "Message",
    value: `<div style="font-size:14px;line-height:22px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(contactData.message)}</div>`,
  },
])}

${paragraph(`<strong style="color:${COLORS.ink};">Submitted:</strong> ${escapeHtml(submittedAt)}`, { muted: true })}
${button("View in dashboard", `${getSiteUrl()}/dashboard/contacts`)}`;

    const html = emailLayout({
      title: "New contact form submission",
      preheader: `New contact form submission from ${contactData.name}`,
      body,
      variant: "internal",
      footerNote: "This is an automated notification — please do not reply to this email.",
    });

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
      console.log(
        `✅ Contact form notification sent to ${successCount} recipient(s)`,
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Error sending contact form notification email:", error);
    return false;
  }
}

// ── Contact form: confirmation to the visitor ─────────────────────────────────
export async function sendContactConfirmationEmail(
  email: string,
  name: string,
  referenceId?: string,
) {
  try {
    const html = contactAutoReplyEmail({ name, referenceId });

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

// ── Newsletter (html is built by the caller, e.g. lib/newsletter-templates) ───
export async function sendNewsletterEmail(
  subscriberEmail: string,
  subject: string,
  html: string,
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"Eventify Newsletter" <${process.env.GMAIL_EMAIL}>`,
      to: subscriberEmail,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send newsletter to ${subscriberEmail}:`, error);
    return false;
  }
}

// ── Newsletter welcome (sent when someone subscribes) ─────────────────────────
export async function sendWelcomeEmail(email: string): Promise<boolean> {
  try {
    const body = `
${eyebrow("Newsletter")}
${heading(`Welcome to ${accent("Eventify")}`)}
${paragraph("Thank you for subscribing to our newsletter. You&rsquo;ll be the first to know about our latest events, awards, and updates from the world of event management.")}
${paragraph("Stay tuned &mdash; great things are coming your way.")}
${button("Visit our website", SITE_URL)}`;

    const html = emailLayout({
      title: "Welcome to the Eventify newsletter",
      preheader: "Thanks for subscribing. Here's what to expect from Eventify.",
      body,
      variant: "public",
    });

    await transporter.sendMail({
      from: `"Eventify Newsletter" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: "Welcome to Eventify Newsletter! 🎉",
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}

// ── Admin welcome email (sent when super admin creates a new admin) ───────────
export async function sendAdminWelcomeEmail(
  email: string,
  firstName: string,
  lastName: string,
  plainPassword: string,
): Promise<boolean> {
  try {
    const body = `
${eyebrow("Dashboard access")}
${heading(`Welcome to the ${accent("team")}, ${escapeHtml(firstName)}.`)}
${paragraph("You&rsquo;ve been added as an admin to the <strong>Eventify</strong> dashboard. Here are your login credentials:")}

${detailTable([
  { label: "Full name", value: `${escapeHtml(firstName)} ${escapeHtml(lastName)}` },
  { label: "Email (login)", value: escapeHtml(email) },
  { label: "Temporary password", value: escapeHtml(plainPassword), mono: true },
])}

${callout("<strong>Important:</strong> please log in and change your password immediately from the <strong>Profile</strong> section in the dashboard.", "warning")}
${button("Log in to dashboard", `${getSiteUrl()}/login`)}`;

    const html = emailLayout({
      title: "You've been added as an Eventify admin",
      preheader: `Welcome to the Eventify dashboard, ${firstName}. Your login details are inside.`,
      body,
      variant: "internal",
      footerNote: "You received this email because you were added as an admin. Do not share your credentials.",
    });

    await transporter.sendMail({
      from: `"Eventify" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: "You've been added as an Eventify Admin",
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send admin welcome email:", error);
    return false;
  }
}

// ── Super admin handover email ────────────────────────────────────────────────
export async function sendHandoverEmail(
  newSuperAdminEmail: string,
  newSuperAdminFirstName: string,
  previousSuperAdminName: string,
): Promise<boolean> {
  try {
    const body = `
${eyebrow("Role update")}
${heading(`You&rsquo;re now the ${accent("Super Admin")}`)}
${paragraph(`Hi <strong style="color:${COLORS.ink};">${escapeHtml(newSuperAdminFirstName)}</strong>, <strong style="color:${COLORS.ink};">${escapeHtml(previousSuperAdminName)}</strong> has handed over the Super Admin role to you on the Eventify dashboard.`)}
${callout("You now have full control over the Eventify admin panel, including managing other admins and handing over the Super Admin role.", "success")}
${button("Go to dashboard", `${getSiteUrl()}/dashboard/admins`)}`;

    const html = emailLayout({
      title: "You are now the Eventify Super Admin",
      preheader: `${previousSuperAdminName} has handed over the Super Admin role to you.`,
      body,
      variant: "internal",
      footerNote: "This is an automated message from the Eventify dashboard.",
    });

    await transporter.sendMail({
      from: `"Eventify" <${process.env.GMAIL_EMAIL}>`,
      to: newSuperAdminEmail,
      subject: "You are now the Eventify Super Admin 👑",
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send handover email:", error);
    return false;
  }
}