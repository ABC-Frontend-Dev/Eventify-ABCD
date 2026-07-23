// components/layout/Projects/Projects.tsx
"use client";

import HeaderDescription from "@/components/common/HeaderDescription";
import HeadingWithLogo from "@/components/common/HeadingWithLogo";
import SubHeading from "@/components/common/SubHeading";
import { Tabs as MainTabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs";
import Image from "next/image";
import axios from "axios";
import Modal from "@/components/ui/modal-drop";
import { useEffect, useMemo, useState } from "react";
import { EmblaCarousel } from "./Carousel";
import { AnimatePresence, motion } from "motion/react";

interface ProjectTab {
    id: number;
    name: string;
    images: string[];
    order: number;
}

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
    hasTabs: boolean;
    tabs: ProjectTab[];
    images: string[];
    categoryId: number;
    category: Category;
}

// Helper function to check if a file is a video
const isVideoFile = (url: string): boolean => {
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some((ext) => lowerUrl.endsWith(ext)) || lowerUrl.includes("/videos/");
};

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [activeTab, setActiveTab] = useState("tab-all");
    const [activeInnerTab, setActiveInnerTab] = useState("");

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

    const categories = useMemo(() => Array.from(new Map(projects.map((project) => [project.category.id, project.category])).values()), [projects]);

    const filteredProjects = activeTab === "tab-all" ? projects : projects.filter((project) => project.categoryId === Number(activeTab.replace("tab-", "")));

    const openModal = (project: Project) => {
        setSelectedProject(project);
        if (project.hasTabs && project.tabs.length > 0) {
            setActiveInnerTab(`inner-tab-${project.tabs[0].id}`);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedProject(null);
            setActiveInnerTab("");
        }, 300);
    };

    if (loading) {
        return (
            <section className="max-w-360 w-full mx-auto px-3.5 lg:px-20 pt-9 lg:py-9 scroll-mt-14">
                <div className="flex items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-360 w-full mx-auto px-3.5 lg:px-20 pt-9 lg:py-9 scroll-mt-14">
            <MainTabs value={activeTab} onValueChange={setActiveTab}>
                <header className="flex items-end justify-between flex-col lg:flex-row gap-y-5">
                    <div>
                        <HeadingWithLogo titlePart1="" titlePart2_1="proj" titlePart2_2="ts" />
                        <SubHeading title="Explore projects" />
                        <HeaderDescription description="The talented individuals working together to create memorable events." scrollContainerRef={undefined} />
                    </div>

                    <TabsList className="p-1.25 rounded-none bg-slate-100 gap-1">
                        <TabsTab value="tab-all" className="rounded-none text-sm py-2 sm:py-4 px-2.75 sm:px-6.75">
                            All Projects
                        </TabsTab>

                        {categories.map((category) => (
                            <TabsTab key={`tab-${category.id}`} value={`tab-${category.id}`} className="rounded-none text-sm py-2 sm:py-4 px-2.75 sm:px-6.75">
                                {category.name}
                            </TabsTab>
                        ))}
                    </TabsList>
                </header>

                <div className="mt-9">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5">
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project) => (
                                <motion.div
                                    key={project.id}
                                    layout
                                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: [0.22, 1, 0.36, 1],
                                        layout: {
                                            duration: 0.45,
                                            ease: [0.22, 1, 0.36, 1],
                                        },
                                    }}
                                >
                                    <ProjectCard project={project} onClick={() => openModal(project)} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </MainTabs>

            <Modal isOpen={isModalOpen} onClose={closeModal} className="h-165.25 w-full max-w-80 lg:max-w-166 bg-white p-0" allowEasyClose={true}>
                {selectedProject && (
                    <div className="p-2.5 h-full flex flex-col bg-white">
                        {/* Modal Content */}
                        {selectedProject.hasTabs && selectedProject.tabs.length > 0 ? (
                            /* PROJECT WITH TABS */
                            <MainTabs value={activeInnerTab} onValueChange={setActiveInnerTab} className="flex-1 flex flex-col">
                                {/* Tabs Navigation */}
                                <div className="mb-2.5">
                                    <TabsList className="p-1.25 rounded-none bg-slate-100 gap-1 w-full justify-start">
                                        {selectedProject.tabs.map((tab) => (
                                            <TabsTab key={tab.id} value={`inner-tab-${tab.id}`} className="rounded-none text-sm py-2 sm:py-4 px-2.75 sm:px-6.75">
                                                {tab.name}
                                            </TabsTab>
                                        ))}
                                    </TabsList>
                                </div>

                                {/* Tab Content */}
                                <div className="flex-1 overflow-hidden">
                                    {selectedProject.tabs.map((tab) => (
                                        <TabsPanel key={tab.id} value={`inner-tab-${tab.id}`} className="h-full">
                                            <div className="h-103 w-full overflow-hidden rounded-xl">
                                                <EmblaCarousel media={tab.images} />
                                            </div>
                                        </TabsPanel>
                                    ))}
                                </div>
                            </MainTabs>
                        ) : (
                            /* PROJECT WITHOUT TABS */
                            <div className="h-103 w-full overflow-hidden rounded-xl">
                                <EmblaCarousel media={selectedProject.images} />
                            </div>
                        )}

                        {/* Project Info Section */}
                        <div className="p-5 mt-auto">
                            <p className="font-product-sans-bold text-2xl lg:text-[34px] font-semibold leading-10 tracking-wide text-footer-bg">{selectedProject.title}</p>

                            <p className="mt-2 font-product-sans-medium text-xl leading-6.5 tracking-wide text-footer-bg">{selectedProject.description}</p>

                            <div className="mt-4 flex items-center gap-3">
                                <div className="inline-block rounded-md bg-primary/10 px-4 py-2">
                                    <span className="text-sm font-medium text-primary">{selectedProject.category.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </section>
    );
}

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
    const isBannerVideo = isVideoFile(project.bannerImage);

    return (
        <div className="relative group h-70 sm:h-105.5">
            <button type="button" onClick={onClick} className="w-full h-full">
                {isBannerVideo ? (
                    <video
                        src={project.bannerImage}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                        }}
                    />
                ) : (
                    <Image src={project.bannerImage} alt={project.title} width={1000} height={1000} className="w-full h-full object-cover" />
                )}

                <div className="group-hover:opacity-100 group-hover:z-10 transition-opacity duration-500 opacity-0 z-0 absolute left-0 top-0 w-full h-full px-10 bg-black/50 backdrop-blur-lg">
                    <div className="flex items-center justify-center flex-col w-full h-full text-white">
                        <h2 className="font-helvetica text-[26px] font-bold text-center">{project.title}</h2>
                        <p className="font-helvetica text-sm leading-4.5 text-center mt-2">{project.description}</p>
                    </div>

                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-fit z-20 bg-white/30 rounded-full block px-4 py-0.5 font-helvetica font-medium text-[16px] text-center text-white cursor-pointer">
                        {project.category.name}
                    </div>
                </div>
            </button>
        </div>
    );
}
