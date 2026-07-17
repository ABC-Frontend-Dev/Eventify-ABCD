"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Edit, MoreVertical, GripVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";

interface ComparisonCardProps {
    id: number;
    title: string;
    beforeImage: string;
    afterImage: string;
    order: number;
    onDelete?: (id: number) => void;
}

export function ComparisonCard({ id, title, beforeImage, afterImage, order, onDelete }: ComparisonCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-lg">
            <div className="absolute top-2 right-2 flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-grab active:cursor-grabbing" title="Drag to reorder">
                    <GripVertical className="h-4 w-4 text-slate-400" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/comparisons/${id}/edit`}>
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

            <div className="space-y-3">
                {/* Image Preview - Before & After */}
                <div className="flex gap-2 h-32 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                    <div className="flex-1 relative">
                        <Image src={beforeImage} alt={`${title} - Before`} fill className="object-cover" />
                        <span className="absolute top-1 left-1 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded">Before</span>
                    </div>
                    <div className="flex-1 relative">
                        <Image src={afterImage} alt={`${title} - After`} fill className="object-cover" />
                        <span className="absolute top-1 right-1 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded">After</span>
                    </div>
                </div>

                {/* Title and Info */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">#{order + 1}</p>
                </div>
            </div>
        </div>
    );
}
