// components/dashboard/layout/projects/ProjectPage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { ProjectCard } from "./ProjectCard";

import { Search, Plus, Filter, X, SlidersHorizontal, CalendarDays, ArrowUpDown, Save, Loader2, GripVertical } from "lucide-react";

import ProjectsLoader from "../loader/ProjectsLoader";
import DashboardHeader from "../common/Header";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
    id: number;
    title: string;
    description?: string | null;
    bannerImage: string;
    images: string[];
    hasTabs?: boolean;
    tabs?: { id: number; name: string; images: string[]; order: number }[];
    categoryId: number;
    createdAt: string;
    category?: { id: number; name: string; description?: string | null } | null;
    client?: { id: number; name?: string } | null;
    [key: string]: unknown;
}

interface Category {
    id: number;
    name: string;
}

type SortOption = "custom" | "newest" | "oldest" | "az" | "za";

const SORT_LABELS: Record<SortOption, string> = {
    custom: "Custom Order",
    newest: "Latest First",
    oldest: "Oldest First",
    az: "Title (A-Z)",
    za: "Title (Z-A)",
};

/** Props handed to ProjectCard (kept in one place so both grids stay identical). */
function toCardProps(project: Project) {
    return {
        id: project.id,
        title: project.title,
        description: project.description ?? "",
        bannerImage: project.bannerImage,
        images: project.images,
        hasTabs: project.hasTabs ?? false,
        tabs: project.tabs ?? [],
        category: {
            id: project.category?.id ?? project.categoryId,
            name: project.category?.name ?? "",
            description: project.category?.description ?? null,
        },
    };
}

// ─── Sortable Card Wrapper ────────────────────────────────────────────────────
// The whole card becomes a drag target through a transparent overlay, so
// ProjectCard itself doesn't need to know about drag & drop (and its links /
// menu can't be clicked by accident while rearranging).

function SortableProjectCard({ project }: { project: Project }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(project.id) });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative">
            <ProjectCard {...toCardProps(project)} onDelete={() => {}} />

            <div {...attributes} {...listeners} className="absolute inset-0 z-20 cursor-grab touch-none rounded-xl ring-2 ring-dashed ring-amber-300/80 active:cursor-grabbing" aria-label={`Drag ${project.title}`}>
                <span className="absolute left-1/2 top-3 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-slate-900/85 px-2.5 py-1 text-[11px] font-medium text-white shadow">
                    <GripVertical className="h-3 w-3" />
                    Drag
                </span>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectPage() {
    const toast = useToasts();

    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [years, setYears] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter states (year + sort are applied by the API, search + category in the browser)
    const [selectedYear, setSelectedYear] = useState<number | "ALL">("ALL");
    const [selectedCategory, setSelectedCategory] = useState<number | "ALL">("ALL");
    const [sortBy, setSortBy] = useState<SortOption>("custom");

    // Rearrange mode state
    const [isRearranging, setIsRearranging] = useState(false);
    const [rearrangedProjects, setRearrangedProjects] = useState<Project[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [startingRearrange, setStartingRearrange] = useState(false);

    // ── Sensors ───────────────────────────────────────────────────────────────

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // prevent accidental drags on click
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // ── Data fetching ─────────────────────────────────────────────────────────

    // Categories for the filter dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("/api/project-categories");
                if (res.data.success) setCategories(res.data.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to load filters");
            }
        };
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Projects refetch when year / sort change
    useEffect(() => {
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear, sortBy]);

    const fetchProjects = async () => {
        try {
            const params = new URLSearchParams({ sort: sortBy });
            if (selectedYear !== "ALL") params.append("year", String(selectedYear));

            const response = await axios.get(`/api/projects?${params.toString()}`);

            if (response.data.success) {
                setProjects(response.data.data);
                setYears(response.data.years ?? []);
            } else {
                toast.error("Failed to load projects");
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────

    const handleDelete = async (id: number) => {
        const projectToDelete = projects.find((p) => p.id === id);

        toast.message({
            text: `Delete "${projectToDelete?.title}"?`,
            preserve: true,
            action: "Delete",

            onAction: async () => {
                try {
                    const response = await axios.delete(`/api/projects/${id}`);

                    if (response.data.success) {
                        fetchProjects();
                        toast.success("Project deleted successfully!");
                    } else {
                        toast.error(response.data.message || "Failed to delete project");
                    }
                } catch (error) {
                    console.error("Error deleting project:", error);
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    // ── Rearrange mode ────────────────────────────────────────────────────────

    const handleEnableRearrange = async () => {
        setStartingRearrange(true);
        try {
            // Always rearrange the FULL list in the saved custom order,
            // whatever year / sort / search is currently applied.
            const response = await axios.get("/api/projects?sort=custom");
            if (!response.data.success) {
                toast.error("Failed to load projects");
                return;
            }
            setRearrangedProjects(response.data.data);
            setIsDirty(false);
            setIsRearranging(true);
        } catch {
            toast.error("Failed to load projects");
        } finally {
            setStartingRearrange(false);
        }
    };

    const handleCancelRearrange = () => {
        setIsRearranging(false);
        setRearrangedProjects([]);
        setIsDirty(false);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = rearrangedProjects.findIndex((p) => String(p.id) === active.id);
        const newIndex = rearrangedProjects.findIndex((p) => String(p.id) === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            setRearrangedProjects((prev) => arrayMove(prev, oldIndex, newIndex));
            setIsDirty(true);
        }
    };

    const handleSaveOrder = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/projects/reorder", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ids: rearrangedProjects.map((p) => p.id),
                }),
            });
            const data = await res.json();

            if (data.success) {
                setIsRearranging(false);
                setRearrangedProjects([]);
                setIsDirty(false);

                // Show the freshly saved order: reset filters, then reload.
                setSelectedYear("ALL");
                setSelectedCategory("ALL");
                setSearchQuery("");
                setSortBy("custom");
                fetchProjects();

                toast.success("Project order saved successfully!");
            } else {
                toast.error("Failed to save order");
            }
        } catch {
            toast.error("Failed to save order");
        } finally {
            setSaving(false);
        }
    };

    // ── Derived data ──────────────────────────────────────────────────────────

    // Search + category are filtered locally on top of what the API returned
    const visibleProjects = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return projects.filter((p) => {
            if (selectedCategory !== "ALL" && p.categoryId !== selectedCategory) return false;
            if (q && !p.title.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [projects, searchQuery, selectedCategory]);

    const clearFilters = () => {
        setSelectedYear("ALL");
        setSelectedCategory("ALL");
        setSortBy("custom");
        setSearchQuery("");
    };

    const hasActiveFilters = selectedYear !== "ALL" || selectedCategory !== "ALL" || sortBy !== "custom" || searchQuery !== "";

    // ── Loading state ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Projects" description="Manage your projects" />

                    <Button asChild>
                        <Link href="/dashboard/projects/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Project
                        </Link>
                    </Button>
                </div>

                <div className="mt-3">
                    <ProjectsLoader />
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="">
            {/* Header */}
            <div className="pb-6 border-b">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <DashboardHeader
                            title="Projects"
                            description={isRearranging ? `Rearranging ${rearrangedProjects.length} projects` : `Manage your projects (${visibleProjects.length} ${hasActiveFilters ? "filtered" : "total"})`}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {!isRearranging ? (
                            <>
                                <Button variant="outline" size="sm" onClick={handleEnableRearrange} disabled={projects.length < 2 || startingRearrange} className="gap-1.5">
                                    {startingRearrange ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpDown className="h-4 w-4" />}
                                    Rearrange
                                </Button>

                                <Button asChild>
                                    <Link href="/dashboard/projects/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add New Project
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={handleCancelRearrange} disabled={saving} className="gap-1.5">
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>

                                <Button size="sm" onClick={handleSaveOrder} disabled={saving || !isDirty} className="gap-1.5 bg-slate-900 hover:bg-slate-700 text-white">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {saving ? "Saving…" : "Save Order"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Search and Filters — hidden in rearrange mode */}
                {!isRearranging && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Year Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9">
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        Year
                                        {selectedYear !== "ALL" && (
                                            <Badge variant="secondary" className="ml-2 h-5 px-1">
                                                1
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Filter by Year</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setSelectedYear("ALL")} className={selectedYear === "ALL" ? "bg-accent" : ""}>
                                        All Years
                                    </DropdownMenuItem>
                                    {years.map((y) => (
                                        <DropdownMenuItem key={y} onClick={() => setSelectedYear(y)} className={selectedYear === y ? "bg-accent" : ""}>
                                            {y}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Category Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Category
                                        {selectedCategory !== "ALL" && (
                                            <Badge variant="secondary" className="ml-2 h-5 px-1">
                                                1
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setSelectedCategory("ALL")} className={selectedCategory === "ALL" ? "bg-accent" : ""}>
                                        All Categories
                                    </DropdownMenuItem>
                                    {categories.map((c) => (
                                        <DropdownMenuItem key={c.id} onClick={() => setSelectedCategory(c.id)} className={selectedCategory === c.id ? "bg-accent" : ""}>
                                            {c.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Sort Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9">
                                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                                        Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                                        <DropdownMenuItem key={key} onClick={() => setSortBy(key)} className={sortBy === key ? "bg-accent" : ""}>
                                            {SORT_LABELS[key]}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-muted-foreground">
                                    <X className="mr-2 h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Active Filters Display */}
                {!isRearranging && hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-sm text-muted-foreground">Active filters:</span>
                        {selectedYear !== "ALL" && (
                            <Badge variant="secondary" className="gap-1">
                                Year: {selectedYear}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedYear("ALL")} />
                            </Badge>
                        )}
                        {selectedCategory !== "ALL" && (
                            <Badge variant="secondary" className="gap-1">
                                Category: {categories.find((c) => c.id === selectedCategory)?.name}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("ALL")} />
                            </Badge>
                        )}
                        {sortBy !== "custom" && (
                            <Badge variant="secondary" className="gap-1">
                                Sort: {SORT_LABELS[sortBy]}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSortBy("custom")} />
                            </Badge>
                        )}
                        {searchQuery && (
                            <Badge variant="secondary" className="gap-1">
                                Search: &quot;{searchQuery}&quot;
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                            </Badge>
                        )}
                    </div>
                )}

                {/* Rearrange mode banner */}
                {isRearranging && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                        <span>
                            Drag any card to reorder your projects. This is the order shown on the website. Click <strong>Save Order</strong> when done.
                            {!isDirty && <span className="ml-1 text-amber-500">(no changes yet)</span>}
                        </span>
                    </div>
                )}
            </div>

            {/* Projects Grid */}
            <div className="pt-6">
                {isRearranging ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={rearrangedProjects.map((p) => String(p.id))} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {rearrangedProjects.map((project) => (
                                    <SortableProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : visibleProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {visibleProjects.map((project) => (
                            <ProjectCard key={project.id} {...toCardProps(project)} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{hasActiveFilters ? "No projects match your filters" : "No projects found"}</h3>
                        <p className="text-muted-foreground mb-4 text-center max-w-sm">
                            {hasActiveFilters ? "Try adjusting your filters or search query" : "Get started by creating your first project"}
                        </p>

                        {hasActiveFilters ? (
                            <Button onClick={clearFilters} variant="outline">
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link href="/dashboard/projects/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Project
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}