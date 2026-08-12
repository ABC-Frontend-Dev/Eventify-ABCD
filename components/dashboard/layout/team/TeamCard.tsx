"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamCardProps {
    id: number;
    name: string;
    role: string;
    image: string;
    onDelete: (id: number) => void;
}

export function TeamCard({ id, name, role, image, onDelete }: TeamCardProps) {
    return (
        <div className="rounded-lg border overflow-hidden bg-card">
            <div className="relative aspect-square bg-muted">
                <Image src={image} alt={name} fill className="object-cover object-top" />
            </div>

            <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{role}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Button asChild size="icon" variant="ghost" className="h-7 w-7">
                        <Link href={`/dashboard/team/${id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onDelete(id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
