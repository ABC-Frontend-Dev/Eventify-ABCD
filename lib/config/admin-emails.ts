// lib/config/admin-emails.ts
export const ADDITIONAL_CONTACT_RECIPIENTS = [
    // Add additional emails here (optional)
    // "support@eventify.com",
    // "support@eventify.com", // Optional: add here
    // "manager@eventify.com",
];

export const CONTACT_FORM_CONFIG = {
    // Whether to send emails on contact form submission
    enableEmailNotification: true,

    // Email subject
    emailSubject: "New Contact Form Submission - Eventify",

    // Sender name
    senderName: "Eventify",
};
