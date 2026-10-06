// lib/email-templates/base-layout.ts
//
// One shared layout + small building blocks for every Eventify email.
// Change the logo, colours, offices or socials here and ALL emails update.

export const SITE_URL = "https://eventifyentertainment.com";
export const LOGO_URL = "https://res.cloudinary.com/afdhm38k/image/upload/v1787295544/eventify-light-logo-with-uae-ksa_m8nbd3.png";

export const COLORS = {
    purple: "#57068C",
    purpleLight: "#b98ae3", // readable on the dark footer
    dark: "#1c1c1f",
    ink: "#0f172a",
    body: "#475569",
    muted: "#94a3b8",
    border: "#e2e8f0",
    panel: "#f8fafc",
    page: "#f1f5f9",
};

export const FONT = "Arial, Helvetica, sans-serif";
export const SERIF = "Georgia, 'Times New Roman', serif";

const SOCIAL_LINKS = [
    { label: "Facebook", href: "https://www.facebook.com/Eventifyentertainment/" },
    { label: "Instagram", href: "https://www.instagram.com/eventifyentertainment/" },
    { label: "LinkedIn", href: "https://ae.linkedin.com/company/eventifyentertainment" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Escapes user-supplied text so it can never inject HTML into an email. */
export function escapeHtml(value: string): string {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ─── Building blocks (return HTML strings) ────────────────────────────────────

/** Small purple uppercase label above the heading. */
export function eyebrow(text: string): string {
    return `<p style="margin:0 0 14px 0;font-family:${FONT};font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;color:${COLORS.purple};">${escapeHtml(text)}</p>`;
}

/** Serif-italic purple word, echoing the site's section titles. Escapes its input. */
export function accent(text: string): string {
    return `<span style="font-family:${SERIF};font-style:italic;font-weight:normal;color:${COLORS.purple};">${escapeHtml(text)}</span>`;
}

/** Main heading. `html` is trusted HTML — escape any dynamic values yourself. */
export function heading(html: string): string {
    return `<h1 class="title" style="margin:0 0 20px 0;font-family:${FONT};font-size:30px;line-height:38px;font-weight:bold;color:${COLORS.ink};">${html}</h1>`;
}

/** Body paragraph. `html` is trusted HTML — escape any dynamic values yourself. */
export function paragraph(html: string, { muted = false }: { muted?: boolean } = {}): string {
    const size = muted ? "13px" : "15px";
    const lineHeight = muted ? "20px" : "24px";
    const color = muted ? "#64748b" : COLORS.body;
    return `<p style="margin:0 0 16px 0;font-family:${FONT};font-size:${size};line-height:${lineHeight};color:${color};">${html}</p>`;
}

/** Bulletproof (Outlook-safe) button. */
export function button(label: string, href: string): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0 0;">
    <tr>
        <td bgcolor="${COLORS.purple}" style="background-color:${COLORS.purple};">
            <a href="${escapeHtml(href)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:14px;line-height:18px;font-weight:bold;letter-spacing:0.3px;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
    </tr>
</table>`;
}

const CALLOUT_TONES = {
    info: { bg: COLORS.panel, border: COLORS.purple, text: COLORS.body },
    warning: { bg: "#fffbeb", border: "#f59e0b", text: "#92400e" },
    success: { bg: "#f0fdf4", border: "#16a34a", text: "#166534" },
};

/** Highlighted note box. `html` is trusted HTML. */
export function callout(html: string, tone: keyof typeof CALLOUT_TONES = "info"): string {
    const t = CALLOUT_TONES[tone];
    return `<div style="margin:0 0 20px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${t.bg};border:1px solid ${COLORS.border};border-left:4px solid ${t.border};">
        <tr>
            <td style="padding:14px 18px;font-family:${FONT};font-size:14px;line-height:22px;color:${t.text};">${html}</td>
        </tr>
    </table>
</div>`;
}

export interface DetailRow {
    label: string;
    /** Trusted HTML — escape dynamic values yourself. */
    value: string;
    mono?: boolean;
}

/** Label/value card (credentials, contact details, etc.). */
export function detailTable(rows: DetailRow[]): string {
    const cells = rows
        .map((row, i) => {
            const isLast = i === rows.length - 1;
            const valueStyle = row.mono ? "font-family:'Courier New', Courier, monospace;font-size:18px;font-weight:bold;letter-spacing:1px;" : "font-size:15px;";
            return `<tr>
            <td style="padding:16px 20px;${isLast ? "" : `border-bottom:1px solid ${COLORS.border};`}font-family:${FONT};">
                <p style="margin:0 0 4px 0;font-size:11px;line-height:14px;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;color:${COLORS.muted};">${escapeHtml(row.label)}</p>
                <div style="margin:0;${valueStyle}line-height:22px;color:${COLORS.ink};">${row.value}</div>
            </td>
        </tr>`;
        })
        .join("");

    return `<div style="margin:0 0 20px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid ${COLORS.border};border-left:4px solid ${COLORS.purple};">
        ${cells}
    </table>
</div>`;
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export interface EmailLayoutOptions {
    /** Browser/tab title. */
    title: string;
    /** Hidden inbox-preview text. */
    preheader: string;
    /** Trusted HTML placed inside the white content area. */
    body: string;
    /**
     * "public"   → for customers/subscribers: offices + social links in the footer.
     * "internal" → for admins/staff: compact footer.
     */
    variant?: "public" | "internal";
    /** Small plain-text line at the bottom of the footer. */
    footerNote?: string;
}

function publicFooter(year: number, footerNote?: string): string {
    const socials = SOCIAL_LINKS.map((s) => `<a href="${s.href}" target="_blank" style="color:#ffffff;text-decoration:none;font-size:12px;font-family:${FONT};">${s.label}</a>`).join(
        `<span style="color:#64748b;padding:0 10px;">|</span>`,
    );

    return `<p style="margin:0 0 18px 0;font-family:${SERIF};font-style:italic;font-size:18px;line-height:24px;color:#ffffff;">Our offices</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td class="stack" width="50%" valign="top" style="padding:0 12px 18px 0;">
            <p style="margin:0 0 4px 0;font-family:${FONT};font-size:11px;line-height:14px;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;color:${COLORS.purpleLight};">UAE</p>
            <p style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:#cbd5e1;">508, API Business Suite, Al Barsha 1,<br>PO Box 449832, Dubai, UAE</p>
        </td>
        <td class="stack stack-gap" width="50%" valign="top" style="padding:0 0 18px 12px;">
            <p style="margin:0 0 4px 0;font-family:${FONT};font-size:11px;line-height:14px;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;color:${COLORS.purpleLight};">KSA</p>
            <p style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:#cbd5e1;">508, Al Noor Business Center, King Fahd Road,<br>Al Olaya District, PO Box 245671, Riyadh, Saudi Arabia</p>
        </td>
    </tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="border-top:1px solid #3f3f46;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
</table>
<p style="margin:18px 0 14px 0;">${socials}</p>
<p style="margin:0;font-family:${FONT};font-size:11px;line-height:16px;color:${COLORS.muted};">
    <a href="${SITE_URL}/" target="_blank" style="color:#ffffff;text-decoration:none;">Eventify Entertainment</a> &copy; ${year}. All rights reserved.${footerNote ? `<br>${escapeHtml(footerNote)}` : ""}
</p>`;
}

function internalFooter(year: number, footerNote?: string): string {
    return `<p style="margin:0;font-family:${FONT};font-size:11px;line-height:16px;color:${COLORS.muted};">
    <a href="${SITE_URL}/" target="_blank" style="color:#ffffff;text-decoration:none;">Eventify Entertainment</a> &copy; ${year}. All rights reserved.
</p>${footerNote ? `\n<p style="margin:6px 0 0 0;font-family:${FONT};font-size:11px;line-height:16px;color:#64748b;">${escapeHtml(footerNote)}</p>` : ""}`;
}

export function emailLayout({ title, preheader, body, variant = "public", footerNote }: EmailLayoutOptions): string {
    const year = new Date().getFullYear();
    const footer = variant === "public" ? publicFooter(year, footerNote) : internalFooter(year, footerNote);
    const footerPadding = variant === "public" ? "32px 40px" : "24px 40px";

    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${escapeHtml(title)}</title>
    <style>
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; }
            .px { padding-left: 24px !important; padding-right: 24px !important; }
            .stack { display: block !important; width: 100% !important; box-sizing: border-box; }
            .stack-gap { padding-top: 0 !important; }
            .title { font-size: 25px !important; line-height: 33px !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.page};-webkit-text-size-adjust:100%;">

    <!-- Preheader (inbox preview text) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
        ${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.page};">
        <tr>
            <td align="center" style="padding:32px 12px;">

                <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border:1px solid ${COLORS.border};">

                    <!-- Header -->
                    <tr>
                        <td class="px" bgcolor="${COLORS.dark}" style="background-color:${COLORS.dark};padding:28px 40px;border-bottom:4px solid ${COLORS.purple};">
                            <a href="${SITE_URL}/" target="_blank" style="text-decoration:none;">
                                <img src="${LOGO_URL}" width="170" alt="Eventify Entertainment | UAE &amp; KSA" style="display:block;width:170px;max-width:100%;height:auto;border:0;outline:none;">
                            </a>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="px" style="padding:44px 40px 40px 40px;font-family:${FONT};">
                            ${body}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="px" bgcolor="${COLORS.dark}" style="background-color:${COLORS.dark};padding:${footerPadding};font-family:${FONT};">
                            ${footer}
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>
</body>
</html>`;
}