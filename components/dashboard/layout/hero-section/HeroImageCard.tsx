// components/dashboard/layout/hero-section/HeroImageCard.tsx

"use client";

import { CheckCircle2, Edit, Trash2 } from "lucide-react";

interface HeroImageCardProps {
    id: number;
    imageUrl: string;
    altText: string | null;
    title: string | null;
    description: string | null;
    isActive: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onToggleActive: () => void;
}

export default function HeroImageCard({ id, imageUrl, altText, title, description, isActive, onEdit, onDelete, onToggleActive }: HeroImageCardProps) {
    return (
        <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
            {/* Thumbnail */}
            <img src={imageUrl} alt={altText || "Hero image"} className="h-16 w-16 object-cover rounded-lg flex-shrink-0" />

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{title || "Untitled"}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{description || "No description"}</p>
                {altText && <p className="text-xs text-slate-400 mt-0.5">Alt: {altText}</p>}
            </div>

            {/* Active Badge */}
            {isActive && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Active</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                {!isActive && (
                    <button onClick={onToggleActive} className="px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-md transition-colors" title="Set as active">
                        Set Active
                    </button>
                )}

                <button onClick={onEdit} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-md transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                </button>

                <button onClick={onDelete} className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
