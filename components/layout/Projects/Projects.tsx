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

// ─── Types ────────────────────────────────────────────────────────────────────

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
    clientId: number | null;
    projectClientLogo: string | null;
    category: Category;
    client: Client | null;
}

// ─── Breakpoint type ──────────────────────────────────────────────────────────

type Breakpoint = "mobile" | "tablet" | "desktop";

// ─── Load more counts per breakpoint ─────────────────────────────────────────
// mobile  : < 768px   → 1 column
// tablet  : 768–1023px → 2 columns
// desktop : ≥ 1024px  → 3 columns

const COUNTS: Record<Breakpoint, { initial: number; increment: number }> = {
    mobile: { initial: 6, increment: 4 },
    tablet: { initial: 6, increment: 4 }, // 2-col grid → multiples of 2
    desktop: { initial: 9, increment: 6 }, // 3-col grid → multiples of 3
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isVideoFile = (url: string): boolean => {
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    const lower = url.toLowerCase();
    return videoExtensions.some((ext) => lower.endsWith(ext)) || lower.includes("/videos/");
};

function getBreakpoint(): Breakpoint {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w < 768) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [activeTab, setActiveTab] = useState("tab-all");
    const [activeInnerTab, setActiveInnerTab] = useState("");

    const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
    const [visibleCount, setVisibleCount] = useState(COUNTS.desktop.initial);

    // ── Fetch ─────────────────────────────────────────────────────────────────

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

    // ── Breakpoint tracking ───────────────────────────────────────────────────
    // Uses two media queries:
    //   mobileQuery  matches when width < 768px  → mobile
    //   tabletQuery  matches when width < 1024px → tablet (if not mobile)
    // This avoids polling and fires instantly on resize.

    useEffect(() => {
        const mobileQuery = window.matchMedia("(max-width: 767px)");
        const tabletQuery = window.matchMedia("(max-width: 1023px)");

        const update = () => setBreakpoint(getBreakpoint());
        update(); // set on mount

        mobileQuery.addEventListener("change", update);
        tabletQuery.addEventListener("change", update);

        return () => {
            mobileQuery.removeEventListener("change", update);
            tabletQuery.removeEventListener("change", update);
        };
    }, []);

    // ── Reset visible count when tab or breakpoint changes ────────────────────

    useEffect(() => {
        setVisibleCount(COUNTS[breakpoint].initial);
    }, [activeTab, breakpoint]);

    // ── Derived values ────────────────────────────────────────────────────────

    const categories = useMemo(() => Array.from(new Map(projects.map((p) => [p.category.id, p.category])).values()), [projects]);

    const filteredProjects = activeTab === "tab-all" ? projects : projects.filter((p) => p.categoryId === Number(activeTab.replace("tab-", "")));

    const { initial: initialCount, increment } = COUNTS[breakpoint];

    const visibleProjects = filteredProjects.slice(0, visibleCount);
    const allLoaded = visibleCount >= filteredProjects.length;
    const showLoadMoreButton = filteredProjects.length > initialCount;

    const handleLoadMoreClick = () => {
        if (allLoaded) {
            setVisibleCount(initialCount);
        } else {
            setVisibleCount((prev) => Math.min(prev + increment, filteredProjects.length));
        }
    };

    // ── Modal ─────────────────────────────────────────────────────────────────

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

    // ── Loading ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <section className="max-w-360 w-full mx-auto px-3.5 lg:px-20 pt-9 lg:py-9 scroll-mt-1">
                <div className="flex items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
                </div>
            </section>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <section className="max-w-360 w-full mx-auto px-3.5 lg:px-20 pt-9 lg:py-9 scroll-mt-1" id="projects">
            <MainTabs value={activeTab} onValueChange={setActiveTab}>
                <header className="flex items-start md:items-start lg:items-end lg:justify-between flex-col lg:flex-row gap-y-5 lg:gap-x-5">
                    <div className="shrink-0">
                        <HeadingWithLogo titlePart1="" titlePart2_1="proj" titlePart2_2="ts" />
                        <SubHeading sectionType="PROJECT" showDescription />
                    </div>

                    <TabsList className="py-1.25 px-2 rounded-none bg-slate-100 gap-0">
                        <TabsTab value="tab-all" className="rounded-none text-sm py-2 sm:py-4 px-2.75 sm:px-3.75">
                            All Projects
                        </TabsTab>
                        {categories.map((category) => (
                            <TabsTab key={`tab-${category.id}`} value={`tab-${category.id}`} className="rounded-none text-sm py-2 sm:py-4 px-2.75 sm:px-3.75">
                                {category.name}
                            </TabsTab>
                        ))}
                    </TabsList>
                </header>

                <div className="mt-3 lg:mt-7.5 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                        <AnimatePresence mode="popLayout">
                            {visibleProjects.map((project) => (
                                <motion.div
                                    key={project.id}
                                    layout
                                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: [0.22, 1, 0.36, 1],
                                        layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                                    }}
                                >
                                    <ProjectCard project={project} onClick={() => openModal(project)} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {showLoadMoreButton && (
                        <div
                            className="absolute bottom-0 left-0 w-full h-85 flex items-end justify-end z-10"
                            style={{
                                background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.7) 60%, #FFFFFF 85%)",
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleLoadMoreClick}
                                className="relative max-w-50 w-fit mx-auto overflow-hidden block text-center h-10 cursor-pointer px-6 py-2 text-sm bg-primary text-white font-helvetica-neue-roman hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {allLoaded ? "View less projects" : "View more projects"}
                            </button>
                        </div>
                    )}
                </div>
            </MainTabs>

            {/* ── Modal ──────────────────────────────────────────────────────── */}
            <Modal isOpen={isModalOpen} onClose={closeModal} className="w-full max-w-80 xxs:max-w-92 md:max-w-2xl lg:max-w-200 bg-white p-0" allowEasyClose={true}>
                {selectedProject && (
                    <MainTabs value={activeInnerTab} onValueChange={setActiveInnerTab}>
                        <div className="flex flex-col bg-white">
                            {/* Media */}
                            <div className="h-110 w-full flex-shrink-0 relative">
                                {selectedProject.hasTabs && selectedProject.tabs.length > 0 ? (
                                    <div className="h-full flex flex-col">
                                        <div className="flex-1 overflow-hidden">
                                            {selectedProject.tabs.map((tab) => (
                                                <TabsPanel key={tab.id} value={`inner-tab-${tab.id}`} className="h-full">
                                                    <div className="h-full w-full overflow-hidden relative">
                                                        <EmblaCarousel media={tab.images} />
                                                    </div>
                                                </TabsPanel>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full w-full overflow-hidden relative">
                                        <EmblaCarousel media={selectedProject.images} />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5 shrink-0 flex gap-5 items-end">
                                <div className="max-w-3/5 w-full shrink-0">
                                    <p className="font-helvetica-medium text-lg lg:text-[22px] font-semibold leading-6.5 tracking-wide text-footer-bg">{selectedProject.title}</p>

                                    {selectedProject.description && <p className="mt-2 font-helvetica-neue-roman text-sm leading-4.5 tracking-wide text-footer-bg">{selectedProject.description}</p>}
                                </div>

                                {selectedProject.hasTabs && selectedProject.tabs.length > 0 && (
                                    <TabsList className="max-w-min w-fit mt-0 p-1.25 rounded-none bg-slate-100 gap-1 justify-start">
                                        {selectedProject.tabs.map((tab) => (
                                            <TabsTab key={tab.id} value={`inner-tab-${tab.id}`} className="rounded-none text-sm py-2 sm:py-4 px-2.75 sm:px-6.75">
                                                {tab.name}
                                            </TabsTab>
                                        ))}
                                    </TabsList>
                                )}
                            </div>
                        </div>
                    </MainTabs>
                )}
            </Modal>
        </section>
    );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
    const isBannerVideo = isVideoFile(project.bannerImage);
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

                <div className="group-hover:opacity-100 group-hover:z-10 transition-opacity duration-500 opacity-0 z-0 absolute left-0 top-0 w-full h-full px-10 bg-black/50">
                    <div className="flex items-center justify-center flex-col w-full h-full text-white">
                        {logoToShow && (
                            <figure className="max-w-56 w-full mb-4">
                                <Image src={logoToShow} alt={project.client?.name || "Client logo"} width={1000} height={1000} className="w-full h-auto object-contain" />
                            </figure>
                        )}
                        {!logoToShow && <h2 className="font-helvetica text-[26px] font-bold text-center">{project.title}</h2>}
                        {/* {project.description && <p className="font-helvetica text-sm leading-4.5 text-center mt-2">{project.description}</p>} */}
                    </div>

                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-fit z-20 bg-white/30 rounded-full block px-4 py-0.5 font-helvetica font-medium text-[16px] text-center text-white cursor-pointer">
                        {project.category.name}
                    </div>
                </div>
            </button>
        </div>
    );
}
