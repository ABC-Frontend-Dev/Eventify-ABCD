// lib/email-templates/contact-auto-reply.ts
import { COLORS, FONT, SITE_URL, accent, button, emailLayout, escapeHtml, eyebrow, heading, paragraph } from "./base-layout";

export function generateReferenceId(): string {
    return Math.random().toString(36).slice(2, 11).toUpperCase();
}

interface ContactAutoReplyOptions {
    name: string;
    /** Prefer the saved contact record's id so the reference can be looked up later. */
    referenceId?: string;
}

export function contactAutoReplyEmail({ name, referenceId = generateReferenceId() }: ContactAutoReplyOptions): string {
    const safeName = escapeHtml(name.trim() || "there");
    const safeRef = escapeHtml(referenceId);

    const body = `
${eyebrow("Message received")}
${heading(`Thank you, ${safeName}. We&rsquo;ve received your ${accent("message")}.`)}
${paragraph("Thank you for getting in touch with Eventify Entertainment. A member of our team will review your enquiry and get back to you as soon as possible.")}

<div style="margin:8px 0 24px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.panel};border:1px solid ${COLORS.border};border-left:4px solid ${COLORS.purple};">
        <tr>
            <td class="stack" width="50%" valign="top" style="padding:18px 20px;font-family:${FONT};">
                <p style="margin:0 0 6px 0;font-size:11px;line-height:14px;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;color:${COLORS.muted};">Reference ID</p>
                <p style="margin:0;font-size:16px;line-height:22px;font-weight:bold;color:${COLORS.ink};font-family:'Courier New', Courier, monospace;letter-spacing:1px;">${safeRef}</p>
            </td>
            <td class="stack stack-gap" width="50%" valign="top" style="padding:18px 20px;font-family:${FONT};">
                <p style="margin:0 0 6px 0;font-size:11px;line-height:14px;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;color:${COLORS.muted};">Expected response</p>
                <p style="margin:0;font-size:16px;line-height:22px;font-weight:bold;color:${COLORS.ink};">Within 24 hours</p>
                <p style="margin:2px 0 0 0;font-size:12px;line-height:16px;color:${COLORS.body};">on business days</p>
            </td>
        </tr>
    </table>
</div>

${paragraph("If your enquiry is time-sensitive, simply reply to this email and let us know &mdash; we&rsquo;ll prioritise it.")}
${button("View our projects", `${SITE_URL}/#projects`)}

<p style="margin:32px 0 0 0;font-family:${FONT};font-size:15px;line-height:24px;color:${COLORS.body};">
    Warm regards,<br>
    <strong style="color:${COLORS.ink};">The Eventify Team</strong>
</p>`;

    return emailLayout({
        title: "We received your message",
        preheader: "Thanks for contacting Eventify. Your message is in and our team will reply within 24 hours on business days.",
        body,
        variant: "public",
        footerNote: "This is an automated confirmation of your enquiry.",
    });
}