"use client";

import { FlipCard } from "@/components/animate-ui/components/community/flip-card";

const projects = [
    {
        title: "JUMANA SAMY",
        description: "SOCIAL MEDIA STRATEGIST",
        defaultImage: "/images/our-teams/JUMANA SAMY.png",
        hoverImage: "/images/our-teams/JUMANA SAMY.png",
        imageAlt: "TEJAL MEHTA",
    },
    {
        title: "TEJAL MEHTA",
        description: "ACCOUNTS EXECUTIVE",
        defaultImage: "/images/our-teams/TEJAL MEHTA.png",
        hoverImage: "/images/our-teams/TEJAL MEHTA.png",
        imageAlt: "TEJAL MEHTA",
    },
];

export const FlipCardDemo = () => {
    return (
        <div className="grid grid-cols-10 gap-x-1.5 gap-y-1">
            {projects.map((project, index) => (
                <FlipCard key={index} data={project} />
            ))}
        </div>
    );
};
