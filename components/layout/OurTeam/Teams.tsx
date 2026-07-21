"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { FlipCard } from "@/components/animate-ui/components/community/flip-card";
import TeamsSkeleton from "./TeamsSkeleton";

interface TeamMember {
    id: number;
    position: number;
    name: string;
    role: string;
    image: string;
}

interface SlotConfig {
    position: number;
    className: string;
    showCaption?: boolean;
    disableFlip?: boolean;
}

// Fixed layout — extracted from the original hardcoded grid. Do not reorder;
// each entry's `position` must match the value admins choose in the form.
const SLOT_LAYOUT: SlotConfig[] = [
    { position: 1, className: "" },
    { position: 2, className: "col-start-1 row-start-2" },
    { position: 3, className: "col-start-1 row-start-4" },
    { position: 4, className: "col-span-2 row-span-2 col-start-1 row-start-5", showCaption: true },
    { position: 5, className: "col-start-2 row-start-1" },
    { position: 6, className: "col-start-2 row-start-2 translate-y-9" },
    { position: 7, className: "col-start-2 row-start-3 translate-y-9" },
    { position: 8, className: "col-start-3 row-start-2" },
    { position: 9, className: "col-start-3 row-start-3" },
    { position: 10, className: "col-start-3 row-start-4" },
    { position: 11, className: "col-start-3 row-start-5" },
    { position: 12, className: "col-start-4 row-start-1" },
    { position: 13, className: "col-start-4 row-start-2", disableFlip: true },
    { position: 14, className: "col-span-3 row-span-3 col-start-4 row-start-3 translate-y-9", showCaption: true },
    { position: 15, className: "col-start-4 row-start-7" },
    { position: 16, className: "col-start-5 row-start-1" },
    { position: 17, className: "col-start-5 row-start-2 translate-y-9" },
    { position: 18, className: "col-start-5 row-start-7" },
    { position: 19, className: "col-start-6 row-start-2 translate-y-9" },
    { position: 20, className: "col-start-6 row-start-7" },
    { position: 21, className: "col-start-7 row-start-1" },
    { position: 22, className: "col-span-2 row-span-2 col-start-7 row-start-3", showCaption: true },
    { position: 23, className: "col-start-7 row-start-5" },
    { position: 24, className: "col-start-7 row-start-6" },
    { position: 25, className: "col-start-8 row-start-1" },
    { position: 26, className: "col-start-8 row-start-2" },
    { position: 27, className: "col-start-8 row-start-5" },
    { position: 28, className: "col-span-2 row-span-2 col-start-8 row-start-6", showCaption: true },
    { position: 29, className: "col-start-9 row-start-2" },
    { position: 30, className: "col-start-9 row-start-3" },
    { position: 31, className: "col-span-2 row-span-2 col-start-9 row-start-4", showCaption: true },
    { position: 32, className: "col-start-10 row-start-1" },
    { position: 33, className: "col-start-10 row-start-3" },
    { position: 34, className: "col-start-10 row-start-6" },
    { position: 35, className: "col-start-10 row-start-7", disableFlip: true },
];

interface GridItemProps {
    member: TeamMember;
    className?: string;
    showCaption?: boolean;
    disableFlip?: boolean;
}

function GridItem({ member, className = "", showCaption = false, disableFlip = false }: GridItemProps) {
    return (
        <div className={`${className} aspect-square overflow-hidden`}>
            <FlipCard
                disableFlip={disableFlip}
                data={{
                    title: member.name,
                    description: member.role,
                    defaultImage: member.image,
                    hoverImage: member.image,
                    imageAlt: member.name,
                }}
            />
        </div>
    );
}

export default function Teams() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const response = await axios.get("/api/team");
            if (response.data.success) {
                setMembers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching team:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <TeamsSkeleton />; // swap for a loader component if you have one

    const memberByPosition = new Map(members.map((m) => [m.position, m]));

    return (
        <div className="relative hidden lg:grid grid-cols-10 grid-rows-7 gap-x-1.5 gap-y-1">
            {SLOT_LAYOUT.map((slot) => {
                const member = memberByPosition.get(slot.position);
                if (!member) return null; // empty slot until someone is assigned to it

                return <GridItem key={slot.position} member={member} className={slot.className} showCaption={slot.showCaption} disableFlip={slot.disableFlip} />;
            })}

            <div className="absolute bottom-14.5 left-5">
                <Image src={"/images/our-teams/People Who Make Moments Happen.png"} alt="People Who Make Moments Happen" width={1000} height={1000} className="w-[319.92] h-20.5 object-contain" />
            </div>
        </div>
    );
}
