// components/dashboard/layout/team/TeamCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamCardProps {
    id: number;
    position: number;
    name: string;
    role: string;
    image: string;
    onDelete: (id: number) => void;
}

export function TeamCard({ id, position, name, role, image, onDelete }: TeamCardProps) {
    return (
        <div className="rounded-lg shadow-sm overflow-hidden bg-card">
            <div className="relative aspect-square bg-muted">
                <Image src={image} alt={name} fill className="object-cover" />
                <span className="absolute top-2 left-2 rounded-full bg-black/70 text-white text-xs px-2 py-1">Slot {position}</span>
            </div>

            <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-medium truncate">{name}</p>
                    <p className="text-sm text-muted-foreground truncate">{role}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Button asChild size="icon" variant="ghost">
                        <Link href={`/dashboard/team/${id}/edit`}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
