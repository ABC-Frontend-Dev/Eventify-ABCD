"use client";

import HeaderDescription from "@/components/common/HeaderDescription";
import HeadingWithLogo from "@/components/common/HeadingWithLogo";
import SubHeading from "@/components/common/SubHeading";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import Image from "next/image";
import axios from "axios";
import Modal from "@/components/ui/modal-drop";
import { useEffect, useState } from "react";
import { EmblaCarousel } from "./Carousel";

interface Category {
    id: number;
    name: string;
    description: string | null;
}

interface Project {
    id: number;
    title: string;
    description: string;
    bannerImage: string;
    images: string[];
    categoryId: number;
    category: Category;
}

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get("/api/projects");

            if (response.data.success) {
                setProjects(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = Array.from(new Map(projects.map((project) => [project.category.id, project.category])).values());

    const openModal = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        // Delay clearing selected project for smooth exit animation
        setTimeout(() => setSelectedProject(null), 300);
    };

    if (loading) {
        return (
            <section className="max-w-360 w-full mx-auto px-20 py-9 scroll-mt-14">
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-360 w-full mx-auto px-20 py-9 scroll-mt-14">
            <Tabs defaultValue="tab-all">
                <header className="flex items-end justify-between">
                    <div>
                        <HeadingWithLogo titlePart1="" titlePart2_1="proj" titlePart2_2="ts" />
                        <SubHeading title="Explore remaining projects" />
                        <HeaderDescription description="The talented individuals working together to create memorable events." scrollContainerRef={undefined} />
                    </div>

                    <TabsList className="p-1.25 rounded-none bg-slate-100 gap-1">
                        <TabsTab value="tab-all" className="rounded-none text-sm py-4 px-6.75">
                            All Projects
                        </TabsTab>

                        {categories.map((category) => (
                            <TabsTab key={`tab-${category.id}`} value={`tab-${category.id}`} className="rounded-none text-sm py-4 px-6.75">
                                {category.name}
                            </TabsTab>
                        ))}
                    </TabsList>
                </header>

                <div className="mt-9">
                    {/* ALL PROJECTS */}
                    <TabsPanel value="tab-all">
                        <div className="grid grid-cols-3 gap-1.5">
                            {projects.map((project) => (
                                <ProjectCard key={`all-${project.id}`} project={project} onClick={() => openModal(project)} />
                            ))}
                        </div>
                    </TabsPanel>

                    {/* CATEGORY PROJECTS */}
                    {categories.map((category) => (
                        <TabsPanel key={`panel-${category.id}`} value={`tab-${category.id}`}>
                            <div className="grid grid-cols-3 gap-1.5">
                                {projects
                                    .filter((project) => project.categoryId === category.id)
                                    .map((project) => (
                                        <ProjectCard key={`cat-${category.id}-${project.id}`} project={project} onClick={() => openModal(project)} />
                                    ))}
                            </div>
                        </TabsPanel>
                    ))}
                </div>
            </Tabs>

            {/* Dynamic Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} className="p-0 max-w-166 w-full h-165.25 bg-white" allowEasyClose={true}>
                {selectedProject && (
                    <div className="p-2.5">
                        {/* Carousel with dynamic images */}
                        <div className="w-full h-103 overflow-hidden">
                            <EmblaCarousel images={selectedProject.images} />
                        </div>

                        {/* Dynamic content */}
                        <div className="p-5">
                            <p className="text-[34px] font-product-sans-bold font-semibold tracking-wide leading-10 text-footer-bg">{selectedProject.title}</p>
                            <p className="text-xl font-product-sans-medium tracking-wide leading-6.5 mt-2 text-footer-bg">{selectedProject.description}</p>
                            <div className="mt-4 inline-block px-4 py-2 bg-primary/10 rounded-md">
                                <span className="text-sm font-medium text-primary">{selectedProject.category.name}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </section>
    );
}

// Extracted ProjectCard component to avoid duplication
interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
    return (
        <div className="relative group h-105.5">
            <Image src={project.bannerImage} alt={project.title} width={1000} height={1000} className="w-full h-full object-cover" />

            <div className="group-hover:opacity-100 group-hover:z-10 transition-opacity duration-500 opacity-0 z-0 absolute left-0 top-0 w-full h-full px-18.25 bg-black/50 backdrop-blur-lg">
                <div className="flex items-center justify-center flex-col w-full h-full text-white">
                    <h2 className="font-helvetica text-[26px] font-bold text-center">{project.title}</h2>

                    <p className="font-helvetica text-sm leading-4.5 text-center mt-2">{project.description}</p>
                </div>

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[93%] z-20 bg-white">
                    <button
                        type="button"
                        onClick={onClick}
                        className="block w-full px-3.75 py-2.5 font-helvetica font-medium text-[16px] text-center text-slate-950 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        {project.category.name}
                    </button>
                </div>
            </div>
        </div>
    );
}
