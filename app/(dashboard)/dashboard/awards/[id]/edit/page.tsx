import AwardForm from "@/components/dashboard/layout/awards/AwardForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditAwardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const awardId = parseInt(id);

    if (isNaN(awardId)) notFound();

    const award = await prisma.award.findUnique({
        where: { id: awardId },
    });

    if (!award) notFound();

    return (
        <AwardForm
            mode="edit"
            awardId={award.id}
            initialData={{
                year: award.year,
            }}
        />
    );
}
