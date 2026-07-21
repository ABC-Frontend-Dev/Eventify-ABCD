"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Edit, MoreVertical, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ServiceCardProps {
    id: number;
    title: string;
    url: string;
    description: string;
    image: string;
    onDelete?: (id: number) => void;
}

export function ServiceCard({ id, title, url, description, image, onDelete }: ServiceCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-lg">
            <div className="absolute top-2 right-2">
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
                        <DropdownMenuItem asChild>
                            <Link href={`/services/${url}`} target="_blank">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Live
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex flex-col items-center space-y-3">
                <div className="h-32 w-full overflow-hidden border rounded-lg">
                    <img src={image} alt={title} className="h-full w-full object-cover" />
                </div>
                <div className="text-center space-y-1 w-full">
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{description}</p>
                    <p className="text-xs text-slate-400 pt-1">/services/{url}</p>
                </div>
            </div>
        </div>
    );
}
