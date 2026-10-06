// components/dashboard/layout/blogs/BlogCard.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Edit, MoreVertical, Eye, Calendar, User, FolderOpen } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatBlogDate, getDisplayDate } from "@/lib/blog-date";

enum BlogStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}

interface BlogCardProps {
    id: number;
    title: string;
    slug: string;
    description: string;
    banner_image: string;
    status: BlogStatus;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    author: {
        id: number;
        name: string;
    };
    category: {
        id: number;
        name: string;
    };
    onDelete?: (id: number) => void;
}

export function BlogCard({ id, title, slug, description, banner_image, status, publishedAt, createdAt, author, category, onDelete }: BlogCardProps) {
    const getStatusColor = (status: BlogStatus) => {
        switch (status) {
            case BlogStatus.PUBLISHED:
                return "bg-green-100 text-green-800 border-green-200";
            case BlogStatus.DRAFT:
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case BlogStatus.ARCHIVED:
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // The date the admin chose; falls back to creation date for older blogs
    const displayDate = formatBlogDate(getDisplayDate({ publishedAt, createdAt }));

    return (
        <div className="group relative rounded-lg border border-slate-200 bg-card transition-all hover:shadow-lg">
            {/* Header with Actions */}
            <Badge className={`${getStatusColor(status)} border absolute left-0 -top-2.5`}>{status}</Badge>
            <div className="absolute top-3 right-3 z-10 flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-6 w-6 bg-white/90 hover:bg-white shadow-sm rounded-xs">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link href={`/blogs/${slug}`} target="_blank" className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Blog
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/blogs/${id}/edit`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => onDelete?.(id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="p-4 flex flex-row items-start gap-4 w-full">
                {/* Banner Image */}
                <div className="relative h-50 max-w-80 w-full overflow-hidden bg-slate-100 rounded-lg">
                    <Image src={banner_image || "/placeholder-blog.png"} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>

                {/* Content */}
                <div className="block min-w-min w-full">
                    {/* URL */}
                    <p className="text-xs leading-3 italic text-muted-foreground">
                        <Link href={`/blogs/${slug}`} target="_blank" className=" underline hover:text-primary transition-colors">
                            {`https://eventifyentertainment.com/blogs/${slug}`}
                        </Link>
                    </p>
                    {/* Title */}
                    <h3 className="mt-1.5 mb-2 font-semibold text-base leading-5 line-clamp-2">{title}</h3>

                    {/* Description */}
                    <p className="mb-2 text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{description}</p>

                    {/* Meta Information */}
                    <div className="space-y-1 pt-2 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span className="font-medium">{author.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FolderOpen className="h-3.5 w-3.5" />
                            <span>{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{displayDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}