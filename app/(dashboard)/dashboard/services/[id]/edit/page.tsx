import ServiceForm from "@/components/dashboard/layout/services/ServiceForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditServicePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const serviceId = parseInt(id);
    if (isNaN(serviceId)) notFound();

    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: {
            comparisonImages: { orderBy: { order: "asc" } },
        },
    });

    if (!service) notFound();

    return (
        <ServiceForm
            mode="edit"
            serviceId={service.id}
            initialData={{
                id: service.id,
                title: service.title,
                url: service.url,
                breadcrumb: service.breadcrumb,
                description: service.description,
                content: service.content,
                bannerImage: service.bannerImage,
                bannerImageAlt: service.bannerImageAlt,
                mediaType: service.mediaType,
                videoUrl: service.videoUrl,
                videoPoster: service.videoPoster,
                comparisonImages: service.comparisonImages.map((img) => ({
                    id: img.id,
                    beforeImage: img.beforeImage,
                    beforeAlt: img.beforeAlt,
                    afterImage: img.afterImage,
                    afterAlt: img.afterAlt,
                })),
            }}
        />
    );
}