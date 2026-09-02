"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink, Video, Images } from "lucide-react";

interface ServiceCardProps {
    id: number;
    title: string;
    description: string | null;
    bannerImage: string;
    url: string;
    mediaType: string;
    order: number;
    onDelete: (id: number) => void;
}

export function ServiceCard({
    id, title, description, bannerImage, url, mediaType, order, onDelete,
}: ServiceCardProps) {
    return (
        <div className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all">
            {/* Banner preview */}
            <div className="relative h-40 bg-slate-100 overflow-hidden">
                {bannerImage ? (
                    <Image
                        src={bannerImage}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <Images className="h-8 w-8 text-slate-300" />
                    </div>
                )}
                {/* Media type badge */}
                <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        mediaType === "video"
                            ? "bg-blue-900/80 text-blue-100"
                            : "bg-slate-900/80 text-slate-100"
                    }`}>
                        {mediaType === "video"
                            ? <><Video className="h-2.5 w-2.5" /> Video</>
                            : <><Images className="h-2.5 w-2.5" /> Comparison</>
                        }
                    </span>
                </div>
                {/* Order badge */}
                <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-slate-600 border border-slate-200">
                        #{order + 1}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-800 truncate">{title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">/services/{url}</p>
                {description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                    <Button asChild size="sm" variant="outline" className="flex-1 h-7 text-xs">
                        <Link href={`/dashboard/services/${id}/edit`}>
                            <Pencil className="h-3 w-3 mr-1.5" /> Edit
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-slate-500 hover:text-slate-900">
                        <a href={`/services/${url}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(id)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}