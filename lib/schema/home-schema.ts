// lib/schema/home-schema.ts
import { getSiteUrl } from "@/lib/constants";

// Logo shown in Google results. Use a hosted PNG/JPG/WebP that's at least 112×112px.
const LOGO_URL = "https://res.cloudinary.com/afdhm38k/image/upload/v1787295544/eventify-dark-logo-with-uae-ksa_ht3x8v.png";

export function getHomeSchema() {
    // getSiteUrl() resolves to the live domain in production, so the ids and
    // urls below never contain localhost.
    const siteUrl = getSiteUrl();
    const homeUrl = `${siteUrl}/`;
    const organizationId = `${siteUrl}/#organization`;
    const websiteId = `${siteUrl}/#website`;
    const webpageId = `${siteUrl}/#webpage`;

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": organizationId,
                name: "Eventify",
                url: homeUrl,
                logo: {
                    "@type": "ImageObject",
                    url: LOGO_URL,
                },
                description: "Eventify is an event management company providing professional event planning and management services in the UAE and Saudi Arabia.",
                areaServed: [
                    { "@type": "Country", name: "United Arab Emirates" },
                    { "@type": "Country", name: "Saudi Arabia" },
                ],
                address: [
                    {
                        "@type": "PostalAddress",
                        streetAddress: "508, API Business Suite, Al Barsha 1",
                        postOfficeBoxNumber: "449832",
                        addressLocality: "Dubai",
                        addressCountry: "AE",
                    },
                    {
                        "@type": "PostalAddress",
                        streetAddress: "508, Al Noor Business Center, King Fahd Road, Al Olaya District",
                        postOfficeBoxNumber: "245671",
                        addressLocality: "Riyadh",
                        addressCountry: "SA",
                    },
                ],
                // Links your official profiles to this organization (optional but recommended)
                sameAs: [
                    "https://www.facebook.com/Eventifyentertainment/",
                    "https://www.instagram.com/eventifyentertainment/",
                    "https://ae.linkedin.com/company/eventifyentertainment",
                ],
            },
            {
                "@type": "WebSite",
                "@id": websiteId,
                url: homeUrl,
                name: "Eventify",
                publisher: { "@id": organizationId },
                inLanguage: "en",
            },
            {
                "@type": "WebPage",
                "@id": webpageId,
                url: homeUrl,
                name: "Event Management Company in Dubai | Eventify",
                isPartOf: { "@id": websiteId },
                about: { "@id": organizationId },
                publisher: { "@id": organizationId },
                inLanguage: "en",
            },
        ],
    };
}

/** Serialises schema for a <script> tag. Escapes "<" so the JSON can never close the tag early. */
export function schemaToJson(schema: object): string {
    return JSON.stringify(schema).replace(/</g, "\\u003c");
}