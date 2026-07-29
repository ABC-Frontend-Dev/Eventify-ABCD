"use client";

import { CheckCircle2, Play } from "lucide-react";
import Image from "next/image";

interface HeroImage {
    id: number;
    imageUrl: string;
    altText: string | null;
    title: string | null;
    description: string | null;
    isActive: boolean;
}

interface HeroSection {
    id: number;
    mediaType: "video" | "image";
    videoUrl: string | null;
    videoTitle: string | null;
    videoDesc: string | null;
    images: HeroImage[];
}

interface HeroSectionViewProps {
    heroSection: HeroSection | null;
}

function SectionHeading({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );
}

export default function HeroSectionView({ heroSection }: HeroSectionViewProps) {
    if (!heroSection) return null;

    return (
        <div className="space-y-6">
            {/* VIDEO DISPLAY */}
            {heroSection.mediaType === "video" && heroSection.videoUrl && (
                <section className="bg-white border border-slate-200 rounded-xl p-6">
                    <SectionHeading label="Current Video Hero" />

                    <div className="space-y-4">
                        {/* Video Preview */}
                        <div className="relative rounded-lg overflow-hidden border border-slate-100 bg-slate-900 aspect-video">
                            <video src={heroSection.videoUrl} className="w-full h-full object-cover" controls poster="/images/loader.png" />
                        </div>

                        {/* Video Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Title */}
                            {heroSection.videoTitle && (
                                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-500 mb-1">Title</p>
                                    <p className="text-sm font-semibold text-slate-800">{heroSection.videoTitle}</p>
                                </div>
                            )}

                            {/* Description */}
                            {heroSection.videoDesc && (
                                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-500 mb-1">Description</p>
                                    <p className="text-sm text-slate-700 line-clamp-2">{heroSection.videoDesc}</p>
                                </div>
                            )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-700">Active Hero Video</span>
                        </div>
                    </div>
                </section>
            )}

            {/* IMAGES DISPLAY */}
            {heroSection.mediaType === "image" && heroSection.images.length > 0 && (
                <section className="bg-white border border-slate-200 rounded-xl p-6">
                    <SectionHeading label="Active Hero Image" />

                    {(() => {
                        const activeImage = heroSection.images.find((img) => img.isActive);
                        if (!activeImage) return null;

                        return (
                            <div className="space-y-4">
                                {/* Image Preview */}
                                <div className="relative rounded-lg overflow-hidden border border-slate-100 bg-slate-50 aspect-video">
                                    <img src={activeImage.imageUrl} alt={activeImage.altText || "Active hero image"} className="w-full h-full object-cover" />
                                </div>

                                {/* Image Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Title */}
                                    {activeImage.title && (
                                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                            <p className="text-xs text-slate-500 mb-1">Title</p>
                                            <p className="text-sm font-semibold text-slate-800">{activeImage.title}</p>
                                        </div>
                                    )}

                                    {/* Alt Text */}
                                    {activeImage.altText && (
                                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                            <p className="text-xs text-slate-500 mb-1">Alt Text</p>
                                            <p className="text-sm text-slate-700">{activeImage.altText}</p>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {activeImage.description && (
                                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 md:col-span-2">
                                            <p className="text-xs text-slate-500 mb-1">Description</p>
                                            <p className="text-sm text-slate-700">{activeImage.description}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-700">Active Hero Image</span>
                                </div>
                            </div>
                        );
                    })()}

                    {/* All Images List */}
                    {heroSection.images.length > 1 && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-sm font-semibold text-slate-700 mb-3">All Images ({heroSection.images.length})</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {heroSection.images.map((image) => (
                                    <div key={image.id} className={`relative rounded-lg overflow-hidden border-2 transition-all ${image.isActive ? "border-emerald-500" : "border-slate-200"}`}>
                                        <img src={image.imageUrl} alt={image.altText || "Hero image"} className="w-full h-24 object-cover" />

                                        {image.isActive && (
                                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                            </div>
                                        )}

                                        {/* Image Info on Hover */}
                                        <div className="absolute inset-0 bg-black/80 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                                            {image.title && <p className="text-xs font-semibold text-white line-clamp-1">{image.title}</p>}
                                            {image.altText && <p className="text-[10px] text-slate-300 line-clamp-1">{image.altText}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
