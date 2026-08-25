// components/layout/Projects/ProjectCard.tsx
"use client";

import Image from "next/image";
export interface ProjectTab {
    id: number;
    name: string;
    images: string[];
    order: number;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
}

export interface Client {
    id: number;
    name: string;
    image: string;
}

export interface Project {
    id: number;
    title: string;
    description: string | null;
    bannerImage: string;
    hasTabs: boolean;
    tabs: ProjectTab[];
    images: string[];
    categoryId: number;
    clientId: number | null;
    projectClientLogo: string | null;
    category: Category;
    client: Client | null;
}

export const isVideoFile = (url: string): boolean => {
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    const lower = url.toLowerCase();
    return videoExtensions.some((ext) => lower.endsWith(ext)) || lower.includes("/videos/");
};

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    const isBannerVideo = isVideoFile(project.bannerImage);
    const logoToShow = project.projectClientLogo || project.client?.image;

    return (
        <div className="relative group h-70 md:h-80 lg:h-105.5">
            <button type="button" onClick={onClick} className="w-full h-full">
                {isBannerVideo ? (
                    <video
                        src={project.bannerImage}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                        }}
                    />
                ) : (
                    <Image src={project.bannerImage} alt={project.title} width={1000} height={1000} className="w-full h-full object-cover" />
                )}

                <div className="group-hover:opacity-100 group-hover:z-10 transition-opacity duration-500 opacity-0 z-0 absolute left-0 top-0 w-full h-full px-10 bg-black/50">
                    <div className="flex items-center justify-center flex-col w-full h-full text-white">
                        {logoToShow && (
                            <figure className="max-w-60 w-full h-28 mb-4">
                                <Image src={logoToShow} alt={project.client?.name || "Client logo"} width={1000} height={1000} className="max-w-60 w-full h-28 object-contain" />
                            </figure>
                        )}
                        {!logoToShow && <h2 className="font-helvetica text-[26px] font-bold text-center">{project.title}</h2>}
                        {/* {project.description && <p className="font-helvetica text-sm leading-4.5 text-center mt-2">{project.description}</p>} */}
                    </div>

                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-fit z-20 bg-white/30 rounded-full block px-4 py-0.5 font-helvetica font-medium text-[16px] text-center text-white cursor-pointer">
                        {project.category.name}
                    </div>
                </div>
            </button>
        </div>
    );
}
