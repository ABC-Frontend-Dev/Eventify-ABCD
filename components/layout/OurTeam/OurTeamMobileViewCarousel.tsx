// components/layout/blogs/BlogListCarouselCard.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

/** True if the name/role contains placeholder punctuation (".", "-")
 * instead of a real value — these are excluded from the carousel. */
function hasPlaceholderPunctuation(name: string, role: string): boolean {
    return /[.-]/.test(name) || /[.-]/.test(role);
}

function CarouselCardSkeleton() {
    return (
        <div className="flex-[0_0_80%] md:flex-[0_0_calc(40%-10px)] w-full pl-5">
            <div className="w-full h-85 rounded-[10px] overflow-hidden relative bg-slate-200 animate-pulse" />
        </div>
    );
}

export function EmblaCarousel() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await axios.get("/api/team");
                if (response.data.success) {
                    const filtered = (response.data.data as TeamMember[])
                        .filter((m) => !EXCLUDED_POSITIONS.includes(m.position))
                        .filter((m) => !hasPlaceholderPunctuation(m.name, m.role))
                        .sort((a, b) => a.position - b.position);

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

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px) and (max-width: 1023.98px)");

        const updateTablet = () => setIsTablet(mediaQuery.matches);

        updateTablet();
        mediaQuery.addEventListener("change", updateTablet);

        return () => mediaQuery.removeEventListener("change", updateTablet);
    }, []);

    const autoplay = useRef(
        Autoplay({
            delay: 3000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            stopOnFocusIn: true,
        }),
    );

    const emblaOptions = useMemo(
        () => ({
            loop: true,
            align: "center" as const,
            // NOTE: containScroll ("trimSnaps") is intentionally NOT used here.
            // It's meant to trim excess empty scroll-snap points at the edges
            // of a NON-looping carousel.
            dragFree: false,
            slidesToScroll: isTablet ? 2 : 1,
            startIndex: isTablet ? 1 : 0,
        }),
        [isTablet],
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, [autoplay.current]);

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

    // Embla measures slide widths at init time, while `loading` is still true
    // and only skeletons exist. Once real `members` data swaps in, slide
    // DOM changes but Embla isn't told to re-measure on its own — reInit
    // whenever the rendered content changes to keep loop-seam math correct.
    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.reInit();
    }, [emblaApi, loading, members]);

    return (
        <div className="relative w-full lg:hidden">
            <div className="overflow-hidden" ref={emblaRef}>
                {/* -ml-5 offsets each slide's pl-5, so the FIRST slide isn't
                    pushed in from the viewport edge, while every slide (including
                    Embla's loop clones) still carries its own spacing as part of
                    its own box — which is what fixes the seam gap. */}
                <div className="flex -ml-5">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => <CarouselCardSkeleton key={i} />)
                        : members.map((item) => (
                              <div
                                  key={item.id}
                                  className="
                                      flex-[0_0_80%]
                                      md:flex-[0_0_calc(40%-10px)]
                                      w-full
                                      max-w-91 md:max-w-none
                                      pl-5
                                  "
                              >
                                  <div className="relative w-full h-72 sm:h-85 rounded-[10px] overflow-hidden">
                                      <figure className="h-full w-full overflow-hidden">
                                          <Image src={item.image} alt={`${item.name} - ${item.role} at Eventify`} width={1000} height={1000} className="h-full w-full object-cover object-top" />
                                      </figure>

                                      <div className="absolute bottom-2.5 max-w-[92%] w-full left-1/2 -translate-x-1/2 p-2.5 bg-white rounded-[4px] overflow-hidden z-10">
                                          <p className="text-base sm:text-[26px] leading-5 sm:leading-7.8 text-center font-helvetica-medium font-medium text-slate-950">{item.name}</p>
                                          <p className="mt-1 text-xs sm:text-base leading-4 sm:leading-5 text-center font-helvetica font-medium text-slate-500">{item.role}</p>
                                      </div>
                                  </div>
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
}
