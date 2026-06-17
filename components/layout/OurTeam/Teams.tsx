// components/layout/OurTeam/Teams.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import TeamModal from "./TeamModal";

interface TeamsProps {
    id: number;
    name: string;
    role: string;
    image: string;
}

interface GridItemProps {
    member: TeamsProps;
    className?: string;
    showCaption?: boolean;
    onClick: (member: TeamsProps, rect: DOMRect) => void;
    isSelected: boolean;
}

function GridItem({ member, className = "", showCaption = false, onClick, isSelected }: GridItemProps) {
    const itemRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            onClick(member, rect);
        }
    };

    return (
        <div
            ref={itemRef}
            className={`cursor-pointer ${className} overflow-hidden group`}
            onClick={handleClick}
            style={{
                visibility: isSelected ? "hidden" : "visible",
            }}
        >
            <figure className="relative h-full">
                <Image src={member.image} alt={member.name} width={1000} height={1000} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {showCaption && (
                    <figcaption className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-[92%] h-fit px-3.5 py-2 our-team-gradient">
                        <h3 className="text-white font-product-sans-bold font-bold text-xl uppercase">{member.name}</h3>
                        <p className="text-white font-product-sans-light text-[16px] uppercase">{member.role}</p>
                    </figcaption>
                )}
            </figure>
        </div>
    );
}

export default function Teams() {
    const [selectedMember, setSelectedMember] = useState<TeamsProps | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [originRect, setOriginRect] = useState<DOMRect | null>(null);

    const teamMembers: TeamsProps[] = [
        { id: 1, name: "TEJAL MEHTA", role: "ACCOUNTS EXECUTIVE", image: "/images/our-teams/TEJAL MEHTA.png" },
        { id: 2, name: "BOB", role: "PRODUCTION MANAGER", image: "/images/our-teams/BOB.png" },
        { id: 3, name: "ANILA RATNAM", role: "SR. EVENT PRODUCER", image: "/images/our-teams/ANILA RATNAM.png" },
        { id: 4, name: "MOHIT BHANDAWAT", role: "CFO", image: "/images/our-teams/MOHIT BHANDAWAT.png" },
        { id: 5, name: "AJAY THOMAS", role: "SR. PRODUCTION MANAGER", image: "/images/our-teams/AJAY THOMAS.png" },
        { id: 6, name: "JUMANA SAMY", role: "SOCIAL MEDIA STRATEGIST", image: "/images/our-teams/JUMANA SAMY.png" },
        { id: 7, name: "AISHWARYA DESHPANDE", role: "EVENT PRODUCER", image: "/images/our-teams/AISHWARYA DESHPANDE.png" },
        { id: 8, name: "MOHAMAD ALBREIDE", role: "SR. CREATIVE DESIGNER", image: "/images/our-teams/MOHAMAD ALBREIDE.png" },
        { id: 9, name: "ALI ALSHEKH", role: "GRAPHIC DESIGNER", image: "/images/our-teams/ALI ALSHEKH.png" },
        { id: 10, name: "MARYAM AMR", role: "EVENT PRODUCER", image: "/images/our-teams/MARYAM AMR.png" },
        { id: 11, name: "MO MOEIN", role: "SR. EVENT PRODUCER", image: "/images/our-teams/MO MOEIN.png" },
        { id: 12, name: "AZEEM SHAH", role: "PRODUCTION MANAGER", image: "/images/our-teams/AZEEM SHAH.png" },
        { id: 13, name: "EVENTIFY", role: "Marketing Manager", image: "/images/our-teams/EVENTIFY.png" },
        { id: 14, name: "GIRISH BHAT", role: "CEO", image: "/images/our-teams/GIRISH BHAT.png" },
        { id: 15, name: "KEITH MAC INTYRE", role: "TECHNICAL DIRECTOR", image: "/images/our-teams/KEITH MAC INTYRE.png" },
        { id: 16, name: "JOJIT DELA PENA", role: "3D DESIGNER", image: "/images/our-teams/JOJIT DELA PENA.png" },
        { id: 17, name: "MAAZ SHABIR", role: "SITE MANAGER", image: "/images/our-teams/MAAZ SHABIR.png" },
        { id: 18, name: "ANU THOMAS", role: "SR. CREATIVE STRATEGIST", image: "/images/our-teams/ANU THOMAS.png" },
        { id: 19, name: "AYA JARRAR", role: "CREATIVE STRATEGIST", image: "/images/our-teams/AYA JARRAR.png" },
        { id: 20, name: "REHAN KHALID", role: "SR. EVENT PRODUCER", image: "/images/our-teams/REHAN KHALID.png" },
        { id: 21, name: "JATTIN GULATI", role: "SR. EVENT PRODUCER", image: "/images/our-teams/JATTIN GULATI.png" },
        { id: 22, name: "VIVEK VELANI", role: "COO", image: "/images/our-teams/VIVEK VELANI.png" },
        { id: 23, name: "BURGESS ELAVIA", role: "DIRECTOR OF PRODUCTION", image: "/images/our-teams/BURGESS ELAVIA.png" },
        { id: 24, name: "ASHRAFALI MOHAMMED", role: "3D VISUALIZER", image: "/images/our-teams/ASHRAFALI MOHAMMED.png" },
        { id: 25, name: "MOHAMED LUBAIB", role: "PRODUCTION MANAGER", image: "/images/our-teams/MOHAMED LUBAIB.png" },
        { id: 26, name: "ANEES MOHAMED", role: "SR. OPERATION MANAGER", image: "/images/our-teams/ANEES MOHAMED.png" },
        { id: 27, name: "MARIANNE BREIDY", role: "EVENT PRODUCER", image: "/images/our-teams/MARIANNE BREIDY.png" },
        { id: 28, name: "SUHAIL MAITREYA", role: "Executive Director", image: "/images/our-teams/SUHAIL MAITREYA.png" },
        { id: 29, name: "RAJAN THOMAS", role: "BRAND DESIGNER", image: "/images/our-teams/RAJAN THOMAS.png" },
        { id: 30, name: "HARINI SHEKHAR", role: "CAD DESIGNER", image: "/images/our-teams/HARINI SHEKHAR.png" },
        { id: 31, name: "SONU AB", role: "Executive Director", image: "/images/our-teams/SONU AB.png" },
        { id: 32, name: "VANITHA GOMES", role: "SR. OPERATION MANAGER", image: "/images/our-teams/VANITHA GOMES.png" },
        { id: 33, name: "YOUSEF GOBRAN", role: "3D DESIGNER", image: "/images/our-teams/YOUSEF GOBRAN.png" },
        { id: 34, name: "SHRAVAN VINOD", role: "EVENT PRODUCER", image: "/images/our-teams/SHRAVAN VINOD.png" },
        { id: 35, name: "LETS EVENTITY", role: "Marketing Manager", image: "/images/our-teams/LETS EVENTITY.png" },
    ];

    const handleItemClick = (member: TeamsProps, rect: DOMRect) => {
        setOriginRect(rect);
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Adjusted the timeout length to cleanly sync up with the exiting phase unmount
        setTimeout(() => {
            setSelectedMember(null);
            setOriginRect(null);
        }, 460);
    };

    return (
        <>
            <div className="relative hidden lg:grid grid-cols-10 grid-rows-7 gap-x-1.5 gap-y-1">
                <GridItem member={teamMembers[0]} onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[0].id} />
                <GridItem member={teamMembers[1]} className="col-start-1 row-start-2" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[1].id} />
                <div className="col-start-1 row-start-3"></div>
                <GridItem member={teamMembers[2]} className="col-start-1 row-start-4" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[2].id} />
                <GridItem
                    member={teamMembers[3]}
                    className="col-span-2 row-span-2 col-start-1 row-start-5"
                    showCaption
                    onClick={handleItemClick}
                    isSelected={selectedMember?.id === teamMembers[3].id}
                />
                <div className="col-start-1 row-start-7"></div>

                <GridItem member={teamMembers[4]} className="col-start-2 row-start-1" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[4].id} />
                <GridItem member={teamMembers[5]} className="col-start-2 row-start-2 translate-y-9" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[5].id} />
                <GridItem member={teamMembers[6]} className="col-start-2 row-start-3 translate-y-9" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[6].id} />
                <div className="col-start-2 row-start-4"></div>
                <div className="col-start-2 row-start-7"></div>

                <div className="col-start-3 row-start-1"></div>
                <GridItem member={teamMembers[7]} className="col-start-3 row-start-2" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[7].id} />
                <GridItem member={teamMembers[8]} className="col-start-3 row-start-3" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[8].id} />
                <GridItem member={teamMembers[9]} className="col-start-3 row-start-4" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[9].id} />
                <GridItem member={teamMembers[10]} className="col-start-3 row-start-5" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[10].id} />
                <div className="col-start-3 row-start-6"></div>
                <div className="col-start-3 row-start-7"></div>

                <GridItem member={teamMembers[11]} className="col-start-4 row-start-1" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[11].id} />
                <GridItem member={teamMembers[12]} className="col-start-4 row-start-2" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[12].id} />
                <GridItem
                    member={teamMembers[13]}
                    className="col-span-3 row-span-3 col-start-4 row-start-3 translate-y-9"
                    showCaption
                    onClick={handleItemClick}
                    isSelected={selectedMember?.id === teamMembers[13].id}
                />
                <div className="col-start-4 row-start-6"></div>
                <GridItem member={teamMembers[14]} className="col-start-4 row-start-7" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[14].id} />

                <GridItem member={teamMembers[15]} className="col-start-5 row-start-1" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[15].id} />
                <GridItem member={teamMembers[16]} className="col-start-5 row-start-2 translate-y-9" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[16].id} />
                <div className="col-start-5 row-start-6"></div>
                <GridItem member={teamMembers[17]} className="col-start-5 row-start-7" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[17].id} />

                <div className="col-start-6 row-start-1"></div>
                <GridItem member={teamMembers[18]} className="col-start-6 row-start-2 translate-y-9" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[18].id} />
                <div className="col-start-6 row-start-6"></div>
                <GridItem member={teamMembers[19]} className="col-start-6 row-start-7" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[19].id} />

                <GridItem member={teamMembers[20]} className="col-start-7 row-start-1" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[20].id} />
                <div className="col-start-7 row-start-2"></div>
                <GridItem
                    member={teamMembers[21]}
                    className="col-span-2 row-span-2 col-start-7 row-start-3"
                    showCaption
                    onClick={handleItemClick}
                    isSelected={selectedMember?.id === teamMembers[21].id}
                />
                <GridItem member={teamMembers[22]} className="col-start-7 row-start-5" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[22].id} />
                <GridItem member={teamMembers[23]} className="col-start-7 row-start-6" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[23].id} />
                <div className="col-start-7 row-start-7"></div>

                <GridItem member={teamMembers[24]} className="col-start-8 row-start-1" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[24].id} />
                <GridItem member={teamMembers[25]} className="col-start-8 row-start-2" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[25].id} />
                <GridItem member={teamMembers[26]} className="col-start-8 row-start-5" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[26].id} />
                <GridItem
                    member={teamMembers[27]}
                    className="col-span-2 row-span-2 col-start-8 row-start-6"
                    showCaption
                    onClick={handleItemClick}
                    isSelected={selectedMember?.id === teamMembers[27].id}
                />

                <div className="col-start-9 row-start-1"></div>
                <GridItem member={teamMembers[28]} className="col-start-9 row-start-2" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[28].id} />
                <GridItem member={teamMembers[29]} className="col-start-9 row-start-3" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[29].id} />
                <GridItem
                    member={teamMembers[30]}
                    className="col-span-2 row-span-2 col-start-9 row-start-4"
                    showCaption
                    onClick={handleItemClick}
                    isSelected={selectedMember?.id === teamMembers[30].id}
                />

                <GridItem member={teamMembers[31]} className="col-start-10 row-start-1" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[31].id} />
                <div className="col-start-10 row-start-2"></div>
                <GridItem member={teamMembers[32]} className="col-start-10 row-start-3" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[32].id} />
                <GridItem member={teamMembers[33]} className="col-start-10 row-start-6" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[33].id} />
                <GridItem member={teamMembers[34]} className="col-start-10 row-start-7" onClick={handleItemClick} isSelected={selectedMember?.id === teamMembers[34].id} />
                <div className="absolute bottom-14.5 left-5">
                    <Image src={"/images/our-teams/People Who Make Moments Happen.png"} alt="People Who Make Moments Happen" width={1000} height={1000} className="w-[319.92] h-20.5 object-contain" />
                </div>
            </div>

            <TeamModal member={selectedMember} isOpen={isModalOpen} onClose={handleCloseModal} originRect={originRect} />
        </>
    );
}
