"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Edit, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
    id: number;
    title: string;
    description: string;
    bannerImage: string;
    images?: string[];
    category: {
        id: number;
        name: string;
        description: string | null;
    };
    onDelete?: (id: number) => void;
}

export function ProjectCard({ id, title, description, bannerImage, category, onDelete }: ProjectCardProps) {
    return (
        <div className="group relative rounded-lg border bg-card p-2.5 transition-all hover:shadow-lg">
            <div className="absolute top-2 right-2 z-30">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
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

            <div className="relative flex flex-row items-center space-x-3 z-10">
                <div className="h-22 w-full rounded-lg">
                    <img src={bannerImage} alt={title} className="h-full w-full object-cover" />
                </div>
                <div className="text-center space-y-1 border-l">
                    <h3 className="font-semibold text-base">{title}</h3>
                    {description && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}
                </div>

                <div className="absolute w-fit max-h-7 h-fit -left-2.5 -top-5 bg-black/30 backdrop-blur-md px-2.5 py-1.5 rounded-xl overflow-hidden z-20 flex">
                    <span className="text-xs leading-4 text-white tracking-wider font-medium">{category.name}</span>
                </div>
            </div>
        </div>
    );
}
