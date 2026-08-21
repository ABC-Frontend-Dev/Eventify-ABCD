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
    role: string; // ← added
    bio: string | null;
    avatar: string | null;
    onDelete?: (id: number) => void;
}

export function AuthorCard({ id, name, email, role, bio, avatar, onDelete }: AuthorCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md">
            {/* Actions */}
            <div className="absolute top-2 right-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
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

            <div className="flex flex-col items-center text-center space-y-3">
                {/* Avatar */}
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-50 shrink-0">
                    <Image src={avatar || "/default-avatar.png"} alt={name} fill className="object-cover" />
                </div>

                {/* Info */}
                <div className="space-y-1 w-full">
                    <h3 className="font-semibold text-sm text-slate-800 leading-tight">{name}</h3>

                    {/* Role badge */}
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{role}</span>

                    <p className="text-xs text-slate-400 truncate">{email}</p>

                    {bio && <p className="text-xs text-slate-400 line-clamp-2 mt-1">{bio}</p>}
                </div>
            </div>
        </div>
    );
}
