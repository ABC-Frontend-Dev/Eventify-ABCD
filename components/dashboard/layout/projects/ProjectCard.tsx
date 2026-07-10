// components/dashboard/layout/projects/ProjectCard.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Edit, MoreVertical, Layers } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ProjectTab {
    id: number;
    name: string;
    images: string[];
    order: number;
}

interface ProjectCardProps {
    id: number;
    title: string;
    description: string;
    bannerImage: string;
    images?: string[];
    hasTabs: boolean;
    tabs: ProjectTab[];
    category: {
        id: number;
        name: string;
        description: string | null;
    };
    onDelete?: (id: number) => void;
}

export function ProjectCard({ id, title, description, bannerImage, category, hasTabs, tabs, images, onDelete }: ProjectCardProps) {
    const totalImages = hasTabs ? tabs.reduce((sum, tab) => sum + tab.images.length, 0) : images?.length || 0;

    return (
        <div className="group relative rounded-lg border bg-card transition-all hover:shadow-lg">
            {/* Dropdown Menu */}
            <div className="absolute top-2 right-2 z-30">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/projects/${id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Banner Image */}
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                <img src={bannerImage} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-xs font-medium text-white tracking-wide">{category.name}</span>
                </div>

                {/* Tabs Indicator */}
                {hasTabs && tabs.length > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-purple-600 px-3 py-1.5 rounded-full">
                        <Layers className="h-3.5 w-3.5 text-white" />
                        <span className="text-xs font-medium text-white">
                            {tabs.length} {tabs.length === 1 ? "Tab" : "Tabs"}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span className="text-xs text-slate-600">{totalImages} images</span>
                    </div>

                    {hasTabs && (
                        <div className="flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-purple-500" />
                            <span className="text-xs text-slate-600">{tabs.length} categories</span>
                        </div>
                    )}
                </div>

                {/* Tabs Preview (if tabs exist) */}
                {hasTabs && tabs.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500 mb-2">Categories:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {tabs.slice(0, 3).map((tab) => (
                                <span key={tab.id} className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                                    {tab.name}
                                </span>
                            ))}
                            {tabs.length > 3 && <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">+{tabs.length - 3} more</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
