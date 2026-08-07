"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Edit, MoreVertical, ImageIcon, Layers } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AwardCardProps {
    id: number;
    year: number;
    categoriesCount: number;
    imagesCount: number;
    onDelete?: (id: number) => void;
}

export function AwardCard({ id, year, categoriesCount, imagesCount, onDelete }: AwardCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md hover:border-slate-300">
            {/* Top-right actions */}
            <div className="absolute top-3 right-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/awards/${id}/edit`}>
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

            {/* Content */}
            <div className="space-y-3 pr-8">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 leading-none">{year}</h3>
                </div>

                <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs text-slate-500">
                            {categoriesCount} categor
                            {categoriesCount !== 1 ? "ies" : "y"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs text-slate-500">
                            {imagesCount} image{imagesCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <div className="pt-1">
                    <Link href={`/dashboard/awards/${id}/edit`} className="text-[11px] text-slate-400 hover:text-slate-700 underline-offset-2 hover:underline transition-colors">
                        Edit award →
                    </Link>
                </div>
            </div>
        </div>
    );
}
