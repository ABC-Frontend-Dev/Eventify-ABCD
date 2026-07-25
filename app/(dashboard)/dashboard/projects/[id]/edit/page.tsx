"use client";

import { useParams } from "next/navigation";
import ProjectForm from "@/components/dashboard/layout/projects/ProjectForm";

export default function ViewProjectPage() {
    const params = useParams();
    const projectId = parseInt(params.id as string);

    return <ProjectForm projectId={projectId} mode="edit" />;
}
