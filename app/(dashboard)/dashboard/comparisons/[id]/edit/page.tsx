import ComparisonForm from "@/components/dashboard/layout/comparisons/ComparisonForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditComparisonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const comparisonId = parseInt(id);

    if (isNaN(comparisonId)) notFound();

    const comparison = await prisma.comparison.findUnique({
        where: { id: comparisonId },
    });

    if (!comparison) notFound();

    return (
        <ComparisonForm
            mode="edit"
            comparisonId={comparison.id}
            initialData={{
                title: comparison.title,
                beforeImage: comparison.beforeImage,
                afterImage: comparison.afterImage,
            }}
        />
    );
}
