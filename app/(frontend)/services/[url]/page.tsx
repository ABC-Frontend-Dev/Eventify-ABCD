// app/(frontend)/services/[url]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ServicesPageContent from "@/components/layout/Services/Services";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ url: string }>;
}): Promise<Metadata> {
    const { url } = await params;
    const service = await prisma.service.findUnique({
        where: { url },
        select: {
            title: true,
            description: true,
            bannerImage: true,
            bannerImageAlt: true,
            metaTitle: true,
            metaDescription: true,
            keywords: true,
            canonical: true,
        },
    });
    if (!service) return { title: "Service Not Found" };

    // ── Fallbacks: SEO fields fall back to the base title/description if the
    // admin never set them, mirroring BlogForm's behavior for blogs.
    const title = service.metaTitle || `${service.title} | Eventify`;
    const description = service.metaDescription || service.description || undefined;
    const canonical = service.canonical || `https://yoursite.com/services/${url}`;

    return {
        title,
        description,
        keywords: service.keywords?.length ? service.keywords : undefined,
        alternates: {
            canonical,
        },
        openGraph: {
            title,
            description,
            url: canonical,
            images: service.bannerImage
                ? [{ url: service.bannerImage, alt: service.bannerImageAlt || service.title }]
                : [],
        },
    };
}

export default async function ServicePage({
    params,
}: {
    params: Promise<{ url: string }>;
}) {
    const { url } = await params;

    const service = await prisma.service.findUnique({
        where: { url },
        include: {
            comparisonImages: { orderBy: { order: "asc" } },
        },
    });

    if (!service) notFound();

    // ── Schema markup: use the admin's custom JSON-LD if provided, otherwise
    // fall back to a minimal auto-generated Service schema so every page
    // still ships *some* structured data even if the admin left it blank.
    let schemaJson: string | null = null;
    if (service.schemaScript) {
        // Trust but verify — if the admin pasted invalid JSON, skip rendering
        // it rather than shipping a broken <script> tag.
        try {
            JSON.parse(service.schemaScript);
            schemaJson = service.schemaScript;
        } catch {
            console.warn(`Invalid schemaScript JSON for service "${service.url}" — falling back to auto-generated schema.`);
        }
    }
    if (!schemaJson) {
        schemaJson = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            description: service.metaDescription || service.description || undefined,
            image: service.bannerImage || undefined,
            url: service.canonical || `https://yoursite.com/services/${service.url}`,
        });
    }

    return (
        <>
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: schemaJson }}
            />
            <ServicesPageContent
                service={{
                    id: service.id,
                    title: service.title,
                    breadcrumb: service.breadcrumb,
                    description: service.description,
                    content: service.content,
                    bannerImage: service.bannerImage,
                    bannerImageAlt: service.bannerImageAlt,
                    mediaType: service.mediaType,
                    videoUrl: service.videoUrl,
                    videoPoster: service.videoPoster,
                    comparisonImages: service.comparisonImages,
                }}
            />
        </>
    );
}