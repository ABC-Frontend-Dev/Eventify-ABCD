// components/layout/Blog/BlogListCarouselCard.tsx

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

interface CarouselItem {
    id: number;
    name: string;
    role: string;
    image: string;
}

// const CAROUSEL_DATA: CarouselItem[] = [
const CAROUSEL_DATA: CarouselItem[] = [
    {
        id: 1,
        name: "TEJAL MEHTA",
        role: "Event Coordinator",
        image: "/images/our-teams/TEJAL MEHTA.png",
    },
    {
        id: 2,
        name: "BOB",
        role: "Marketing Manager",
        image: "/images/our-teams/BOB.png",
    },
    {
        id: 3,
        name: "ANILA RATNAM",
        role: "Marketing Manager",
        image: "/images/our-teams/ANILA RATNAM.png",
    },
    {
        id: 4,
        name: "MOHIT BHANDAWAT",
        role: "CFO",
        image: "/images/our-teams/MOHIT BHANDAWAT.png",
    },
    {
        id: 5,
        name: "AJAY THOMAS",
        role: "Marketing Manager",
        image: "/images/our-teams/AJAY THOMAS.png",
    },
    {
        id: 6,
        name: "JUMANA SAMY",
        role: "Marketing Manager",
        image: "/images/our-teams/JUMANA SAMY.png",
    },
    {
        id: 7,
        name: "AISHWARYA DESHPANDE",
        role: "Marketing Manager",
        image: "/images/our-teams/AISHWARYA DESHPANDE.png",
    },
    {
        id: 8,
        name: "MOHAMAD ALBREIDE",
        role: "Marketing Manager",
        image: "/images/our-teams/MOHAMAD ALBREIDE.png",
    },
    {
        id: 9,
        name: "ALI ALSHEKH",
        role: "Marketing Manager",
        image: "/images/our-teams/ALI ALSHEKH.png",
    },
    {
        id: 10,
        name: "MARYAM AMR",
        role: "Marketing Manager",
        image: "/images/our-teams/MARYAM AMR.png",
    },
    {
        id: 11,
        name: "MO MOEIN",
        role: "Marketing Manager",
        image: "/images/our-teams/MO MOEIN.png",
    },
    {
        id: 12,
        name: "AZEEM SHAH",
        role: "Marketing Manager",
        image: "/images/our-teams/AZEEM SHAH.png",
    },
    {
        id: 13,
        name: "EVENTIFY",
        role: "Marketing Manager",
        image: "/images/our-teams/EVENTIFY.png",
    },
    {
        id: 14,
        name: "GIRISH BHAT",
        role: "Marketing Manager",
        image: "/images/our-teams/GIRISH BHAT.png",
    },
    {
        id: 15,
        name: "KEITH MAC INTYRE",
        role: "Marketing Manager",
        image: "/images/our-teams/KEITH MAC INTYRE.png",
    },
    {
        id: 16,
        name: "JOJIT DELA PENA",
        role: "Marketing Manager",
        image: "/images/our-teams/JOJIT DELA PENA.png",
    },
    {
        id: 17,
        name: "MAAZ SHABIR",
        role: "Marketing Manager",
        image: "/images/our-teams/MAAZ SHABIR.png",
    },
    {
        id: 18,
        name: "ANU THOMAS",
        role: "Marketing Manager",
        image: "/images/our-teams/ANU THOMAS.png",
    },
    {
        id: 19,
        name: "AYA JARRAR",
        role: "Marketing Manager",
        image: "/images/our-teams/AYA JARRAR.png",
    },
    {
        id: 20,
        name: "REHAN KHALID",
        role: "Marketing Manager",
        image: "/images/our-teams/REHAN KHALID.png",
    },
    {
        id: 21,
        name: "JATTIN GULATI",
        role: "Marketing Manager",
        image: "/images/our-teams/JATTIN GULATI.png",
    },
    {
        id: 22,
        name: "VIVEK VELANI",
        role: "COO",
        image: "/images/our-teams/VIVEK VELANI.png",
    },
    {
        id: 23,
        name: "BURGESS ELAVIA",
        role: "Marketing Manager",
        image: "/images/our-teams/BURGESS ELAVIA.png",
    },
    {
        id: 24,
        name: "ASHRAFALI MOHAMMED",
        role: "Marketing Manager",
        image: "/images/our-teams/ASHRAFALI MOHAMMED.png",
    },
    {
        id: 25,
        name: "MOHAMED LUBAIB",
        role: "Marketing Manager",
        image: "/images/our-teams/MOHAMED LUBAIB.png",
    },
    {
        id: 26,
        name: "ANEES MOHAMED",
        role: "Marketing Manager",
        image: "/images/our-teams/ANEES MOHAMED.png",
    },
    {
        id: 27,
        name: "MARIANNE BREIDY",
        role: "Marketing Manager",
        image: "/images/our-teams/MARIANNE BREIDY.png",
    },
    {
        id: 28,
        name: "SUHAIL MAITREYA",
        role: "Executive Director",
        image: "/images/our-teams/SUHAIL MAITREYA.png",
    },
    {
        id: 29,
        name: "RAJAN THOMAS",
        role: "Marketing Manager",
        image: "/images/our-teams/RAJAN THOMAS.png",
    },
    {
        id: 30,
        name: "HARINI SHEKHAR",
        role: "Marketing Manager",
        image: "/images/our-teams/HARINI SHEKHAR.png",
    },
    {
        id: 31,
        name: "SONU AB",
        role: "Executive Director",
        image: "/images/our-teams/SONU AB.png",
    },
    {
        id: 32,
        name: "VANITHA GOMES",
        role: "Marketing Manager",
        image: "/images/our-teams/VANITHA GOMES.png",
    },
    {
        id: 33,
        name: "YOUSEF GOBRAN",
        role: "Marketing Manager",
        image: "/images/our-teams/YOUSEF GOBRAN.png",
    },
    {
        id: 34,
        name: "SHRAVAN VINOD",
        role: "Marketing Manager",
        image: "/images/our-teams/SHRAVAN VINOD.png",
    },
    {
        id: 35,
        name: "LETS EVENTITY",
        role: "Marketing Manager",
        image: "/images/our-teams/LETS EVENTITY.png",
    },
];

export function EmblaCarousel() {
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
            align: "center",
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
        <div className="relative w-full">
            {/* Carousel Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-5">
                    {CAROUSEL_DATA.map((item) => (
                        <div key={item.id} className="flex-[0_0_calc(100%/1)] lg:flex-[0_0_calc((100%-14px)/3)] max-w-91 w-full  h-85 rounded-[10px] overflow-hidden relative">
                            <figure className="h-full w-full overflow-hidden">
                                <Image src={item.image} alt={item.name} width={1000} height={1000} className="h-full w-full object-cover object-top" />
                            </figure>
                            <div className="absolute bottom-2.5 max-w-[95%] w-full left-1/2 -translate-x-1/2 p-2.5 bg-white rounded-[4px] overflow-hidden z-10">
                                <p className="text-[26px] leading-7.8 text-center font-helvetica-medium font-medium text-slate-950">{item.name}</p>
                                <p className="mt-1 text-base leading-5 text-center font-helvetica font-medium text-slate-500">{item.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
