// components/layout/Projects/Projects.tsx
"use client";

import HeadingWithLogo from "@/components/common/HeadingWithLogo";
import SubHeading from "@/components/common/SubHeading";
import { Tabs as MainTabs, TabsList, TabsTab } from "@/components/ui/tabs";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

export interface ProjectTab {
    id: number;
    name: string;
    images: string[];
    order: number;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
}

export interface Client {
    id: number;
    name: string;
    image: string;
}

export interface Project {
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

export const isVideoFile = (url: string): boolean => {
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    const lower = url.toLowerCase();
    return (
        videoExtensions.some((ext) => lower.endsWith(ext)) ||
        lower.includes("/videos/")
    );
};

// ─── Breakpoint type ──────────────────────────────────────────────────────────

type Breakpoint = "mobile" | "tablet" | "desktop";

// ─── Load more counts per breakpoint ─────────────────────────────────────────
// mobile  : < 768px    → 1 column  → show 5 initially, +3 each time
// tablet  : 768–1023px → 2 columns → show 6 initially, +4 each time
// desktop : ≥ 1024px   → 3 columns → show 9 initially, +6 each time

const COUNTS: Record<Breakpoint, { initial: number; increment: number }> = {
    mobile: { initial: 5, increment: 3 },
    tablet: { initial: 6, increment: 4 },
    desktop: { initial: 9, increment: 6 },
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

    // ── Start with null so we know "not yet measured" ─────────────────────────
    // We use null as the initial value to indicate the breakpoint hasn't been
    // measured yet (window is unavailable during SSR). The first useEffect
    // below immediately measures and sets the real breakpoint + visibleCount.
    const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
    const [visibleCount, setVisibleCount] = useState<number>(COUNTS["desktop"].initial);

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

    // ── Measure real breakpoint on mount + track resizes ─────────────────────
    // This runs only on the client after hydration, so window is always
    // available. We immediately correct breakpoint and visibleCount to the
    // actual screen size, fixing the SSR "always desktop" bug.

    useEffect(() => {
        // Correct immediately on mount
        const bp = getBreakpoint();
        setBreakpoint(bp);
        setVisibleCount(COUNTS[bp].initial);

        // Then keep tracking resizes
        const handleResize = () => {
            const next = getBreakpoint();
            setBreakpoint((prev) => {
                if (prev !== next) return next;
                return prev;
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ── Reset visible count when tab or breakpoint changes ────────────────────

    useEffect(() => {
        setVisibleCount(COUNTS[breakpoint].initial);
    }, [activeTab, breakpoint]);

    // ── Derived values ────────────────────────────────────────────────────────

    const categories = useMemo(
        () =>
            Array.from(
                new Map(projects.map((p) => [p.category.id, p.category])).values()
            ),
        [projects]
    );

    const filteredProjects =
        activeTab === "tab-all"
            ? projects
            : projects.filter(
                  (p) => p.categoryId === Number(activeTab.replace("tab-", ""))
              );

    const { initial: initialCount, increment } = COUNTS[breakpoint];

    const visibleProjects = filteredProjects.slice(0, visibleCount);
    const allLoaded = visibleCount >= filteredProjects.length;
    const showLoadMoreButton = filteredProjects.length > initialCount;

    const handleLoadMoreClick = () => {
        if (allLoaded) {
            setVisibleCount(initialCount);
        } else {
            setVisibleCount((prev) =>
                Math.min(prev + increment, filteredProjects.length)
            );
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
            <section className="max-w-360 w-full mx-auto px-3.5 lg:px-20 pt-9 lg:py-9 scroll-mt-6 md:scroll-mt-1">
                <div className="flex items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
                </div>
            </section>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <section
            className="max-w-360 w-full mx-auto px-3.5 lg:px-20 pt-9 lg:py-9 scroll-mt-6 md:scroll-mt-1"
            id="projects"
        >
            <MainTabs value={activeTab} onValueChange={setActiveTab}>
                <header className="flex items-start md:items-start lg:items-end lg:justify-between flex-col lg:flex-row gap-y-5 lg:gap-x-5">
                    <div className="shrink-0">
                        <HeadingWithLogo
                            titlePart1=""
                            titlePart2_1="proj"
                            titlePart2_2="cts"
                        />
                        <SubHeading sectionType="PROJECT" showDescription />
                    </div>

                    <TabsList className="py-0 px-0 rounded-none bg-white gap-1">
                        <TabsTab
                            value="tab-all"
                            className="rounded-none text-sm py-2 sm:py-4 px-2.75 sm:px-3.75"
                        >
                            All Projects
                        </TabsTab>
                        {categories.map((category) => (
                            <TabsTab
                                key={`tab-${category.id}`}
                                value={`tab-${category.id}`}
                                className="rounded-none text-sm py-2 sm:py-4 px-2.75 sm:px-3.75"
                            >
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
                                        layout: {
                                            duration: 0.45,
                                            ease: [0.22, 1, 0.36, 1],
                                        },
                                    }}
                                >
                                    <ProjectCard
                                        project={project}
                                        onClick={() => openModal(project)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {showLoadMoreButton && (
                        <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100.50%] h-50 sm:h-60 md:h-70 lg:h-85 flex items-end justify-end z-10 pointer-events-none"
                            style={
                                allLoaded
                                    ? undefined
                                    : {
                                          background:
                                              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.7) 60%, #FFFFFF 85%)",
                                      }
                            }
                        >
                            <button
                                type="button"
                                onClick={handleLoadMoreClick}
                                className={`relative max-w-50 w-fit mx-auto overflow-hidden block text-center h-7 sm:h-8 md:h-10 cursor-pointer px-2 sm:px-4 md:px-5 lg:px-6 py-2 text-xs md:text-sm leading-3 md:leading-3.5 bg-primary text-white font-helvetica-neue-roman hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto ${
                                    allLoaded
                                        ? "translate-y-8 sm:translate-y-9.5 md:translate-y-11"
                                        : "translate-y-0"
                                }`}
                            >
                                {allLoaded ? "View less projects" : "View more projects"}
                            </button>
                        </div>
                    )}
                </div>
            </MainTabs>

            {/* ── Modal ── */}
            <ProjectModal
                isOpen={isModalOpen}
                onClose={closeModal}
                project={selectedProject}
                activeInnerTab={activeInnerTab}
                onActiveInnerTabChange={setActiveInnerTab}
            />
        </section>
    );
}