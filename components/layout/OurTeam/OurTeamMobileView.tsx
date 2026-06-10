// components/layout/OurTeam/Teams.tsx
"use client";
import { EmblaCarousel } from "./OurTeamMobileViewCarousel";

export default function OurTeamMobileView() {
    return (
        <div className="block lg:hidden">
            <EmblaCarousel />
        </div>
    );
}
