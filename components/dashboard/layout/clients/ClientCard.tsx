"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Edit, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ClientCardProps {
    id: number;
    name: string;
    description: string | null;
    image: string;
    onDelete?: (id: number) => void;
}

export function ClientCard({ id, name, description, image, onDelete }: ClientCardProps) {
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
                            <Link href={`/dashboard/clients/${id}/edit`}>
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

            <div className="flex flex-col items-center space-y-3">
                <div className="h-20 w-full overflow-hidden border-b pb-2">
                    <img src={image} alt={name} className="h-full w-full object-contain" />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="font-semibold text-lg">{name}</h3>
                    {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
                </div>
            </div>
        </div>
    );
}
