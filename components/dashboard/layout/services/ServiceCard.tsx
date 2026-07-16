"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Edit, MoreVertical, GripVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";

interface ServiceCardProps {
    id: number;
    title: string;
    description: string;
    image: string;
    url: string;
    order: number;
    onDelete?: (id: number) => void;
}

export function ServiceCard({ id, title, description, image, url, order, onDelete }: ServiceCardProps) {
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
                            <Link href={`/dashboard/services/${id}/edit`}>
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

            <div className="flex flex-col space-y-3">
                <div className="h-32 w-full overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                    <Image src={image} alt={title} width={400} height={300} className="h-full w-full object-cover" />
                </div>

                <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base line-clamp-1">{title}</h3>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 whitespace-nowrap">#{order + 1}</span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>

                    <p className="text-xs text-slate-400 font-mono mt-2">{url}</p>
                </div>
            </div>
        </div>
    );
}
