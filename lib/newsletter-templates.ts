// lib/newsletter-templates.ts

const BRAND_COLOR = "#57068C";
const LOGO_URL = "https://res.cloudinary.com/afdhm38k/image/upload/v1785846557/logo_liluod.png";
const SITE_URL = "https://eventifyentertainment.com";
const YEAR = new Date().getFullYear();

// ─── Shared layout wrapper ────────────────────────────────────────────────────

function layout(content: string, unsubscribeUrl: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>Eventify Newsletter</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F4;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">

        <!-- Header -->
        <tr>
          <td style="background-color:${BRAND_COLOR};border-radius:10px 10px 0 0;padding:28px 32px;text-align:center;">
            <img src="${LOGO_URL}" alt="Eventify" width="160" style="display:block;margin:0 auto 0 auto;max-width:160px;height:auto;"/>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="background-color:#ffffff;padding:40px 32px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#272727;border-radius:0 0 10px 10px;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 8px 0;font-size:13px;color:#94A3B8;">
              <a href="${SITE_URL}" style="color:#94A3B8;text-decoration:none;">eventifyentertainment.com</a>
            </p>
            <p style="margin:0 0 12px 0;font-size:12px;color:#64748B;">
              Eventify &copy; ${YEAR} &middot; All rights reserved
            </p>
            <p style="margin:0;font-size:11px;color:#475569;">
              You're receiving this because you subscribed to Eventify newsletters.<br/>
              <a href="${unsubscribeUrl}" style="color:#7C3AED;text-decoration:underline;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ctaButton(text: string, url: string): string {
    return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0 auto;">
  <tr>
    <td align="center" style="border-radius:6px;background-color:${BRAND_COLOR};">
      <a href="${url}"
         style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.01em;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

function divider(): string {
    return `<hr style="border:none;border-top:1px solid #E2E8F0;margin:28px 0;"/>`;
}

function label(text: string): string {
    return `<p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND_COLOR};">${text}</p>`;
}

// ─── Template definitions ─────────────────────────────────────────────────────

export type TemplateId = "event-announcement" | "monthly-roundup" | "award-celebration" | "blog-digest" | "promotional-offer";

export interface TemplateField {
    key: string;
    label: string;
    type: "text" | "textarea" | "url" | "date";
    placeholder?: string;
    required?: boolean;
}

export interface TemplateDefinition {
    id: TemplateId;
    name: string;
    description: string;
    fields: TemplateField[];
    render: (data: Record<string, string>, unsubscribeUrl: string) => string;
}

// ── 1. Event Announcement ─────────────────────────────────────────────────────

const eventAnnouncement: TemplateDefinition = {
    id: "event-announcement",
    name: "Event Announcement",
    description: "Announce an upcoming event with date, location and details",
    fields: [
        { key: "eventName", label: "Event Name", type: "text", placeholder: "Gala Night 2026", required: true },
        { key: "eventDate", label: "Event Date", type: "date", required: true },
        { key: "location", label: "Location", type: "text", placeholder: "Burj Al Arab, Dubai", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "Join us for an unforgettable evening…", required: true },
        { key: "ctaText", label: "Button Text", type: "text", placeholder: "Register Now", required: true },
        { key: "ctaUrl", label: "Button URL", type: "url", placeholder: "https://eventifyentertainment.com/events/…", required: true },
    ],
    render(data, unsubscribeUrl) {
        const content = `
<p style="margin:0 0 6px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND_COLOR};">Upcoming Event</p>
<h1 style="margin:0 0 24px 0;font-size:28px;font-weight:800;color:#0F172A;line-height:1.25;">${data.eventName}</h1>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background-color:#F8F0FF;border-radius:8px;border-left:4px solid ${BRAND_COLOR};padding:0;margin-bottom:28px;">
  <tr>
    <td style="padding:20px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" style="padding-right:12px;">
            ${label("Date")}
            <p style="margin:0;font-size:15px;color:#1E293B;font-weight:600;">
              ${new Date(data.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </td>
          <td width="50%">
            ${label("Location")}
            <p style="margin:0;font-size:15px;color:#1E293B;font-weight:600;">${data.location}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

${label("About the Event")}
<p style="margin:0;font-size:15px;color:#475569;line-height:1.75;">${data.description.replace(/\n/g, "<br/>")}</p>

${ctaButton(data.ctaText || "Register Now", data.ctaUrl)}`;
        return layout(content, unsubscribeUrl);
    },
};

// ── 2. Monthly Roundup ────────────────────────────────────────────────────────

const monthlyRoundup: TemplateDefinition = {
    id: "monthly-roundup",
    name: "Monthly Roundup",
    description: "Share monthly highlights and what's been happening",
    fields: [
        { key: "month", label: "Month & Year", type: "text", placeholder: "July 2026", required: true },
        { key: "intro", label: "Intro Message", type: "textarea", placeholder: "Here's what we've been up to this month…", required: true },
        { key: "highlight1Title", label: "Highlight 1 Title", type: "text", placeholder: "DSF Drone Show", required: true },
        { key: "highlight1Body", label: "Highlight 1 Body", type: "textarea", placeholder: "We produced the spectacular…", required: true },
        { key: "highlight2Title", label: "Highlight 2 Title", type: "text", placeholder: "New Partnership", required: false },
        { key: "highlight2Body", label: "Highlight 2 Body", type: "textarea", placeholder: "", required: false },
        { key: "highlight3Title", label: "Highlight 3 Title", type: "text", placeholder: "Award Win", required: false },
        { key: "highlight3Body", label: "Highlight 3 Body", type: "textarea", placeholder: "", required: false },
        { key: "ctaText", label: "Button Text", type: "text", placeholder: "Read More", required: true },
        { key: "ctaUrl", label: "Button URL", type: "url", placeholder: "https://eventifyentertainment.com", required: true },
    ],
    render(data, unsubscribeUrl) {
        const highlights = [
            { title: data.highlight1Title, body: data.highlight1Body },
            { title: data.highlight2Title, body: data.highlight2Body },
            { title: data.highlight3Title, body: data.highlight3Body },
        ].filter((h) => h.title && h.body);

        const highlightRows = highlights
            .map(
                (h, i) => `
<tr>
  <td style="padding:${i > 0 ? "20px 0 0 0" : "0"};">
    <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#0F172A;">${h.title}</p>
    <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">${h.body.replace(/\n/g, "<br/>")}</p>
  </td>
</tr>`,
            )
            .join("");

        const content = `
<p style="margin:0 0 4px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND_COLOR};">Monthly Roundup</p>
<h1 style="margin:0 0 20px 0;font-size:28px;font-weight:800;color:#0F172A;">${data.month}</h1>
<p style="margin:0 0 32px 0;font-size:15px;color:#475569;line-height:1.75;">${data.intro.replace(/\n/g, "<br/>")}</p>

${divider()}
${label("This Month's Highlights")}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
  ${highlightRows}
</table>

${ctaButton(data.ctaText || "Read More", data.ctaUrl)}`;
        return layout(content, unsubscribeUrl);
    },
};

// ── 3. Award Celebration ──────────────────────────────────────────────────────

const awardCelebration: TemplateDefinition = {
    id: "award-celebration",
    name: "Award Celebration",
    description: "Celebrate an award win or recognition",
    fields: [
        { key: "awardName", label: "Award Name", type: "text", placeholder: "WOW Awards Middle East 2026", required: true },
        { key: "category", label: "Award Category", type: "text", placeholder: "Best Event of the Year", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "We are thrilled to announce…", required: true },
        { key: "imageUrl", label: "Award Image URL (optional)", type: "url", placeholder: "https://…" },
        { key: "ctaText", label: "Button Text", type: "text", placeholder: "See Our Awards", required: true },
        { key: "ctaUrl", label: "Button URL", type: "url", placeholder: "https://eventifyentertainment.com/#awards", required: true },
    ],
    render(data, unsubscribeUrl) {
        const imageBlock = data.imageUrl
            ? `<tr><td style="padding-bottom:28px;text-align:center;">
                <img src="${data.imageUrl}" alt="${data.awardName}" width="100%"
                     style="max-width:520px;border-radius:8px;display:block;margin:0 auto;"/>
               </td></tr>`
            : "";

        const content = `
<p style="margin:0 0 4px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND_COLOR};">🏆 Award Celebration</p>
<h1 style="margin:0 0 8px 0;font-size:28px;font-weight:800;color:#0F172A;line-height:1.25;">${data.awardName}</h1>
<p style="margin:0 0 28px 0;font-size:17px;color:${BRAND_COLOR};font-weight:600;">${data.category}</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  ${imageBlock}
  <tr>
    <td>
      ${label("The Story")}
      <p style="margin:0;font-size:15px;color:#475569;line-height:1.75;">${data.description.replace(/\n/g, "<br/>")}</p>
    </td>
  </tr>
</table>

${ctaButton(data.ctaText || "See Our Awards", data.ctaUrl)}`;
        return layout(content, unsubscribeUrl);
    },
};

// ── 4. Blog Digest ────────────────────────────────────────────────────────────

const blogDigest: TemplateDefinition = {
    id: "blog-digest",
    name: "Blog Digest",
    description: "Share your latest blog posts with subscribers",
    fields: [
        { key: "intro", label: "Intro Message", type: "textarea", placeholder: "Here are our latest articles…", required: true },
        { key: "blog1Title", label: "Blog 1 Title", type: "text", placeholder: "Event Planning Checklist", required: true },
        { key: "blog1Description", label: "Blog 1 Description", type: "textarea", placeholder: "Everything you need to know…", required: true },
        { key: "blog1Url", label: "Blog 1 URL", type: "url", placeholder: "https://eventifyentertainment.com/blogs/…", required: true },
        { key: "blog2Title", label: "Blog 2 Title", type: "text", placeholder: "", required: false },
        { key: "blog2Description", label: "Blog 2 Description", type: "textarea", placeholder: "", required: false },
        { key: "blog2Url", label: "Blog 2 URL", type: "url", placeholder: "", required: false },
        { key: "blog3Title", label: "Blog 3 Title", type: "text", placeholder: "", required: false },
        { key: "blog3Description", label: "Blog 3 Description", type: "textarea", placeholder: "", required: false },
        { key: "blog3Url", label: "Blog 3 URL", type: "url", placeholder: "", required: false },
    ],
    render(data, unsubscribeUrl) {
        const blogs = [
            { title: data.blog1Title, desc: data.blog1Description, url: data.blog1Url },
            { title: data.blog2Title, desc: data.blog2Description, url: data.blog2Url },
            { title: data.blog3Title, desc: data.blog3Description, url: data.blog3Url },
        ].filter((b) => b.title && b.url);

        const blogCards = blogs
            .map(
                (b) => `
<tr>
  <td style="padding-bottom:20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 6px 0;font-size:16px;font-weight:700;color:#0F172A;">${b.title}</p>
          ${b.desc ? `<p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;">${b.desc.replace(/\n/g, "<br/>")}</p>` : ""}
          <a href="${b.url}"
             style="display:inline-block;font-size:13px;font-weight:600;color:${BRAND_COLOR};text-decoration:none;border-bottom:1.5px solid ${BRAND_COLOR};">
            Read Article →
          </a>
        </td>
      </tr>
    </table>
  </td>
</tr>`,
            )
            .join("");

        const content = `
<p style="margin:0 0 4px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND_COLOR};">Blog Digest</p>
<h1 style="margin:0 0 20px 0;font-size:28px;font-weight:800;color:#0F172A;">Latest from Our Blog</h1>
<p style="margin:0 0 32px 0;font-size:15px;color:#475569;line-height:1.75;">${data.intro.replace(/\n/g, "<br/>")}</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  ${blogCards}
</table>`;
        return layout(content, unsubscribeUrl);
    },
};

// ── 5. Promotional Offer ──────────────────────────────────────────────────────

const promotionalOffer: TemplateDefinition = {
    id: "promotional-offer",
    name: "Promotional Offer",
    description: "Share a special offer or promotion with your subscribers",
    fields: [
        { key: "offerTitle", label: "Offer Title", type: "text", placeholder: "Exclusive Early Bird Discount", required: true },
        { key: "offerDetail", label: "Offer Detail / Discount", type: "text", placeholder: "20% OFF all event packages", required: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "For a limited time, we're offering…", required: true },
        { key: "deadline", label: "Deadline", type: "text", placeholder: "Valid until 31 July 2026", required: false },
        { key: "ctaText", label: "Button Text", type: "text", placeholder: "Claim Offer", required: true },
        { key: "ctaUrl", label: "Button URL", type: "url", placeholder: "https://eventifyentertainment.com/contact", required: true },
    ],
    render(data, unsubscribeUrl) {
        const deadlineBlock = data.deadline ? `<p style="margin:20px 0 0 0;font-size:13px;color:#DC2626;font-weight:600;">⏰ ${data.deadline}</p>` : "";

        const content = `
<p style="margin:0 0 4px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND_COLOR};">Special Offer</p>
<h1 style="margin:0 0 20px 0;font-size:28px;font-weight:800;color:#0F172A;line-height:1.25;">${data.offerTitle}</h1>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background:linear-gradient(135deg,#F8F0FF 0%,#EDE9FE 100%);border-radius:10px;margin-bottom:28px;">
  <tr>
    <td style="padding:28px;text-align:center;">
      <p style="margin:0;font-size:32px;font-weight:900;color:${BRAND_COLOR};letter-spacing:-0.01em;">${data.offerDetail}</p>
      ${deadlineBlock}
    </td>
  </tr>
</table>

${label("Details")}
<p style="margin:0;font-size:15px;color:#475569;line-height:1.75;">${data.description.replace(/\n/g, "<br/>")}</p>

${ctaButton(data.ctaText || "Claim Offer", data.ctaUrl)}`;
        return layout(content, unsubscribeUrl);
    },
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const TEMPLATES: TemplateDefinition[] = [eventAnnouncement, monthlyRoundup, awardCelebration, blogDigest, promotionalOffer];

export function getTemplate(id: TemplateId): TemplateDefinition | undefined {
    return TEMPLATES.find((t) => t.id === id);
}

export function renderTemplate(id: TemplateId, data: Record<string, string>, unsubscribeUrl: string): string | null {
    const template = getTemplate(id);
    if (!template) return null;
    return template.render(data, unsubscribeUrl);
}
