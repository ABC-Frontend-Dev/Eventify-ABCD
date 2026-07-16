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
    });

    if (!service) notFound();

    return (
        <ServiceForm
            mode="edit"
            serviceId={service.id}
            initialData={{
                title: service.title,
                description: service.description,
                image: service.image,
                url: service.url,
                order: service.order,
            }}
        />
    );
}