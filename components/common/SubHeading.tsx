"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import HeaderDescription from "./HeaderDescription";

gsap.registerPlugin(ScrollTrigger, SplitText);

type SectionType = "CLIENT" | "SERVICE" | "TEAM" | "PROJECT" | "AWARD" | "BLOG" | "SYL";

interface SubHeadingProps {
    // ── Option A: pass static strings directly (backward compatible) ──────────
    titlePartOne?: string;
    titlePartTwo?: string;
    // ── Option B: pass a section type and it fetches automatically ────────────
    sectionType?: SectionType;
    // ── Optional: also render description below ───────────────────────────────
    showDescription?: boolean;
    descriptionClassName?: string;
}

interface SectionData {
    titlePartOne: string;
    titlePartTwo: string | null;
    description: string | null;
}

// Simple in-memory cache so each section type is only fetched once per page load
const cache: Partial<Record<SectionType, SectionData>> = {};

export default function SubHeading({ titlePartOne: staticPartOne, titlePartTwo: staticPartTwo, sectionType, showDescription = false, descriptionClassName }: SubHeadingProps) {
    const textRef = useRef<HTMLHeadingElement>(null);

    const [data, setData] = useState<SectionData | null>(
        // If static props passed — use them immediately, no fetch needed
        staticPartOne
            ? {
                  titlePartOne: staticPartOne,
                  titlePartTwo: staticPartTwo ?? null,
                  description: null,
              }
            : null,
    );

    // ── Fetch from API if sectionType is provided ─────────────────────────────

    useEffect(() => {
        if (!sectionType) return;
        if (staticPartOne) return; // static props take priority

        // Use cache if available
        if (cache[sectionType]) {
            setData(cache[sectionType]!);
            return;
        }

        fetch(`/api/sections/${sectionType.toLowerCase()}`)
            .then((r) => r.json())
            .then((res) => {
                if (res.success && res.data) {
                    cache[sectionType] = res.data;
                    setData(res.data);
                }
            })
            .catch(() => {});
    }, [sectionType, staticPartOne]);

    // ── GSAP animation — re-runs whenever text changes ────────────────────────

    useEffect(() => {
        if (!textRef.current || !data?.titlePartOne) return;

        const split = new SplitText(textRef.current, { type: "chars" });

        gsap.set(split.chars, {
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
        });

        const ctx = gsap.context(() => {
            gsap.to(split.chars, {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.6,
                stagger: 0.03,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: textRef.current,
                    start: "top 80%",
                    end: "top 50%",
                    toggleActions: "play none none reverse",
                },
            });
        }, textRef);

        return () => {
            ctx.revert();
            split.revert();
        };
    }, [data]);

    // ── Nothing to render yet ─────────────────────────────────────────────────

    if (!data?.titlePartOne) return null;

    return (
        <div>
            <h3
                ref={textRef}
                className="text-xl md:text-2xl lg:text-4xl leading-6 md:leading-7 lg:leading-10 font-helvetica-neue-roman font-bold normal-case text-primary wrap-break-word"
                style={{ willChange: "filter" }}
            >
                {data.titlePartOne}
                {data.titlePartTwo && (
                    <>
                        {" "}
                        <span className="font-abc-laica-a-italic-variable-trial font-medium normal-case italic">{data.titlePartTwo}</span>
                    </>
                )}
            </h3>

            {showDescription && data.description && <HeaderDescription description={data.description} scrollContainerRef={undefined} />}
        </div>
    );
}
