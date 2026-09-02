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
        select: { title: true, description: true, bannerImage: true, bannerImageAlt: true },
    });
    if (!service) return { title: "Service Not Found" };
    return {
        title: `${service.title} | Eventify`,
        description: service.description || undefined,
        openGraph: {
            title: `${service.title} | Eventify`,
            description: service.description || undefined,
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

    return (
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
    );
}