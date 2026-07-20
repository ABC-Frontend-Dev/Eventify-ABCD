"use client";

import { use } from "react";
import TeamForm from "@/components/dashboard/layout/team/TeamForm";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const memberId = parseInt(id);

    return <TeamForm mode="edit" memberId={memberId} />;
}
