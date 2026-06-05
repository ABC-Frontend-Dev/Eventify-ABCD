"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Edit, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AuthorCardProps {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    avatar: string | null;
    onDelete?: (id: number) => void;
}

export function AuthorCard({ id, name, email, bio, avatar, onDelete }: AuthorCardProps) {
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
                            <Link href={`/dashboard/authors/${id}/edit`}>
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
                    <Image src={avatar || "/default-avatar.png"} alt={name} width={80} height={80} className="h-full w-full object-contain" />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="font-semibold text-lg">{name}</h3>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    {bio && <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>}
                </div>
            </div>
        </div>
    );
}
