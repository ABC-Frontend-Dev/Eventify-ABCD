import ServiceForm from "@/components/dashboard/layout/services/ServiceForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const serviceId = parseInt(id);

    if (isNaN(serviceId)) notFound();

    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: {
            images: {
                orderBy: { order: "asc" },
            },
        },
    });

    if (!service) notFound();

    // Transform images - ensure title is always a string
    const transformedImages = service.images.map((img) => ({
        id: img.id,
        image: img.image,
        title: img.title || `Image ${img.id}`, // ← Provide default if null/empty
    }));

    return (
        <ServiceForm
            mode="edit"
            serviceId={service.id}
            initialData={{
                id: service.id,
                title: service.title,
                description: service.description,
                content: service.content,
                image: service.image,
                bannerImage: service.bannerImage || "",
                url: service.url,
                order: service.order,
                images: transformedImages,
            }}
        />
    );
}
