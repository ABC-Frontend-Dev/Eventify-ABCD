import AwardForm from "@/components/dashboard/layout/awards/AwardForm";
import { notFound } from "next/navigation";

export default async function EditAwardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const awardId = parseInt(id);

    if (isNaN(awardId)) notFound();

    return <AwardForm mode="edit" awardId={awardId} />;
}
