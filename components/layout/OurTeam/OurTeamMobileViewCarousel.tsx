// components/layout/blogs/BlogListCarouselCard.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import axios from "axios";

interface TeamMember {
    id: number;
    position: number;
    name: string;
    role: string;
    image: string;
}

// These two positions are special decorative slots in the grid (the
// "EVENTIFY" logo card and the "LETS EVENTIFY!" card), not real team
// members — keep them out of this carousel.
const EXCLUDED_POSITIONS = [13, 35];

function CarouselCardSkeleton() {
    return <div className="flex-[0_0_80%] max-w-91 w-full h-85 rounded-[10px] overflow-hidden relative bg-slate-200 animate-pulse" />;
}

export function EmblaCarousel() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await axios.get("/api/team");
                if (response.data.success) {
                    const filtered = (response.data.data as TeamMember[]).filter((m) => !EXCLUDED_POSITIONS.includes(m.position)).sort((a, b) => a.position - b.position);
                    setMembers(filtered);
                }
            } catch (error) {
                console.error("Error fetching team:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, []);

    const autoplay = useRef(
        Autoplay({
            delay: 3000, // 3 seconds
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            stopOnFocusIn: true,
        }),
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: "center", // centers the active slide so the 20% remainder splits evenly, giving a ~10% peek on each side
            containScroll: "trimSnaps",
            dragFree: false,
        },
        [autoplay.current],
    );

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    return (
        <div className="relative w-full lg:hidden">
            {/* Carousel Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-5">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => <CarouselCardSkeleton key={i} />)
                        : members.map((item) => (
                              <div key={item.id} className="flex-[0_0_80%] max-w-91 w-full h-72 sm:h-85 rounded-[10px] overflow-hidden relative">
                                  <figure className="h-full w-full overflow-hidden">
                                      <Image src={item.image} alt={item.name} width={1000} height={1000} className="h-full w-full object-cover object-top" />
                                  </figure>
                                  <div className="absolute bottom-2.5 max-w-[92%] w-full left-1/2 -translate-x-1/2 p-2.5 bg-white rounded-[4px] overflow-hidden z-10">
                                      <p className="text-base sm:text-[26px] leading-5 sm:leading-7.8 text-center font-helvetica-medium font-medium text-slate-950">{item.name}</p>
                                      <p className="mt-1 text-xs sm:text-base leading-4 sm:leading-5 text-center font-helvetica font-medium text-slate-500">{item.role}</p>
                                  </div>
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
}
