"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Edit, MoreVertical, GripVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AwardCardProps {
    id: number;
    year: number;
    categoriesCount: number;
    onDelete?: (id: number) => void;
}

export function AwardCard({ id, year, categoriesCount, onDelete }: AwardCardProps) {
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

            <div className="space-y-2">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900">{year}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {categoriesCount} award categor{categoriesCount !== 1 ? "ies" : "y"}
                    </p>
                </div>
            </div>
        </div>
    );
}
