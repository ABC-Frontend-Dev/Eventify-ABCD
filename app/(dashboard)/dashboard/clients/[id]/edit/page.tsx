import ClientForm from "@/components/dashboard/layout/clients/ClientForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) notFound();

    const client = await prisma.clients.findUnique({
        where: { id: clientId },
    });

    if (!client) notFound();

    return (
        <ClientForm
            mode="edit"
            clientId={client.id}
            initialData={{
                name: client.name,
                description: client.description || "",
                image: client.image,
            }}
        />
    );
}
