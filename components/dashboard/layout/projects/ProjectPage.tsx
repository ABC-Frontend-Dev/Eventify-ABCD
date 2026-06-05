"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DashboardHeader from "../common/Header";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import { useToasts } from "@/components/ui/toast";
import { ProjectCard } from "./ProjectCard";
import ProjectsLoader from "../loader/ProjectsLoader";

interface Project {
    id: number;
    title: string;
    description: string;
    bannerImage: string;
    images: string[];
    categoryId: number;
}

export default function ProjectsPage() {
    const toast = useToasts();
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);
    const fetchProjects = async () => {
        try {
            const response = await axios.get("/api/projects");

            console.log(response.data.data);
            if (response.data.data) {
                setProjects(response.data.data);
            } else {
                toast.error("Failed to load projects");
            }
        } catch (error) {
            console.log("Failed to load projects");
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter((project) => project.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Projects" description={`Manage your projects (${filteredProjects.length} total)`} />

                    <Button asChild>
                        <Link href="/dashboard/clients/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Client
                        </Link>
                    </Button>
                </div>

                <div className="mt-3">
                    <ProjectsLoader />
                </div>
            </div>
        );
    }
    return (
        <div className="">
            <div className="pb-6 border-b">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <DashboardHeader title="Projects" description={`Manage your projects (${filteredProjects.length} total)`} />
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/projects/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Project
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 mt-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search projects..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="pt-6">
                {filteredProjects.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProjects.map((project) => (
                            <ProjectCard
                                category={{
                                    id: 0,
                                    name: "",
                                    description: null,
                                }}
                                key={project.id}
                                {...project}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        {/* <p className="text-muted-foreground mb-4">{searchQuery ? "No clients found matching your search" : "No clients found"}</p> */}

                        <Button asChild>
                            <Link href="/dashboard/clients/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Client
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
