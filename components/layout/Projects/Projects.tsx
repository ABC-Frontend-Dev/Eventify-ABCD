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

interface Client {
    id: number;
    name: string;
    image: string;
}

interface Project {
    id: number;
    title: string;
    description: string | null;
    bannerImage: string;
    hasTabs: boolean;
    tabs: ProjectTab[];
    images: string[];
    categoryId: number;
    clientId: number | null; // ✅ NEW
    projectClientLogo: string | null; // ✅ NEW
    category: Category;
    client: Client | null; // ✅ NEW
}

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
                <header className="flex items-end md:items-start lg:items-end justify-between flex-col lg:flex-row gap-y-5">
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

                <div className="mt-4 lg:mt-9">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
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

            <Modal isOpen={isModalOpen} onClose={closeModal} className="w-full max-w-80 xxs:max-w-92 md:max-w-2xl lg:max-w-166 bg-white p-0" allowEasyClose={true}>
                {selectedProject && (
                    <div className="flex flex-col bg-white">
                        {/* Media Section - Fixed height */}
                        <div className="h-103 w-full flex-shrink-0 relative">
                            {selectedProject.hasTabs && selectedProject.tabs.length > 0 ? (
                                <MainTabs value={activeInnerTab} onValueChange={setActiveInnerTab} className="h-full flex flex-col">
                                    <div className="flex-shrink-0 absolute left-5 top-5 z-20 bg-white">
                                        <TabsList className="p-1.25 rounded-none bg-slate-100 gap-1 w-full justify-start">
                                            {selectedProject.tabs.map((tab) => (
                                                <TabsTab key={tab.id} value={`inner-tab-${tab.id}`} className="rounded-none text-sm py-2 sm:py-4 px-2.75 sm:px-6.75">
                                                    {tab.name}
                                                </TabsTab>
                                            ))}
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 overflow-hidden">
                                        {selectedProject.tabs.map((tab) => (
                                            <TabsPanel key={tab.id} value={`inner-tab-${tab.id}`} className="h-full">
                                                <div className="h-full w-full overflow-hidden relative">
                                                    <EmblaCarousel media={tab.images} />
                                                    <div className="absolute bottom-5 right-5 flex items-center gap-3">
                                                        <div className="inline-block rounded-[4px] bg-white px-2 py-1">
                                                            <span className="text-sm font-medium text-primary">{selectedProject.category.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsPanel>
                                        ))}
                                    </div>
                                </MainTabs>
                            ) : (
                                <div className="h-full w-full overflow-hidden relative">
                                    <EmblaCarousel media={selectedProject.images} />
                                    <div className="absolute bottom-5 right-5 flex items-center gap-3">
                                        <div className="inline-block rounded-[4px] bg-white px-2 py-1">
                                            <span className="text-sm font-medium text-primary">{selectedProject.category.name}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Section - Flexible height */}
                        <div className="p-5 flex-shrink-0">
                            {/* ✅ NEW: Show logo if exists (from client or custom) */}
                            {selectedProject.client?.image || selectedProject.projectClientLogo ? (
                                <figure className="mb-4 max-w-48">
                                    <Image
                                        src={selectedProject.projectClientLogo || selectedProject.client?.image || ""}
                                        alt={selectedProject.client?.name || "Client logo"}
                                        width={500}
                                        height={200}
                                        className="w-full h-auto object-contain"
                                    />
                                </figure>
                            ) : (
                                /* ✅ Show title when no logo */
                                <p className="font-helvetica-medium text-2xl lg:text-[22px] font-semibold leading-6.5 tracking-wide text-footer-bg">{selectedProject.title}</p>
                            )}

                            {selectedProject.description && <p className="mt-2 font-helvetica-neue-roman text-xl leading-6.5 tracking-wide text-footer-bg">{selectedProject.description}</p>}
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
    // ✅ NEW: Determine which logo to show
    const logoToShow = project.projectClientLogo || project.client?.image;

    return (
        <div className="relative group h-70 md:h-80 lg:h-105.5">
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
                        {/* ✅ NEW: Show logo if exists */}
                        {logoToShow && (
                            <figure className="max-w-40 w-full mb-4">
                                <Image src={logoToShow} alt={project.client?.name || "Client logo"} width={1000} height={1000} className="w-full h-auto object-contain" />
                            </figure>
                        )}

                        {/* ✅ NEW: Show title only if no logo */}
                        {!logoToShow && <h2 className="font-helvetica text-[26px] font-bold text-center">{project.title}</h2>}

                        {project.description && <p className="font-helvetica text-sm leading-4.5 text-center mt-2">{project.description}</p>}
                    </div>

                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-fit z-20 bg-white/30 rounded-full block px-4 py-0.5 font-helvetica font-medium text-[16px] text-center text-white cursor-pointer">
                        {project.category.name}
                    </div>
                </div>
            </button>
        </div>
    );
}
