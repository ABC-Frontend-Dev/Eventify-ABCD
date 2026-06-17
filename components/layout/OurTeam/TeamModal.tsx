// components/layout/ourteam/teammodel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface TeamMember {
    id: number;
    name: string;
    role: string;
    image: string;
}

interface TeamModalProps {
    member: TeamMember | null;
    isOpen: boolean;
    onClose: () => void;
    originRect: DOMRect | null;
}

type Phase = "hidden" | "entering" | "visible" | "exiting";

export default function TeamModal({ member, isOpen, onClose, originRect }: TeamModalProps) {
    const [phase, setPhase] = useState<Phase>("hidden");
    const [lockedRect, setLockedRect] = useState<DOMRect | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollYRef = useRef<number>(0); // Keeps track of scroll position

    // Scroll lock logic - Blocks scrolling but leaves the scrollbar visible
    useEffect(() => {
        // Function to completely stop mouse wheel, trackpad, and touch scrolling
        const preventDefault = (e: Event) => {
            e.preventDefault();
        };

        if (phase === "entering" || phase === "visible") {
            // 1. Keep the scrollbar track visible by using your original padding trick
            document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
            document.body.style.overflow = "hidden";

            // 2. Add event listeners to block ALL scroll inputs (Wheel, Touch, Keys)
            window.addEventListener("wheel", preventDefault, { passive: false });
            window.addEventListener("touchmove", preventDefault, { passive: false });
        } else if (phase === "hidden") {
            // Restore normal behavior
            document.body.style.paddingRight = "";
            document.body.style.overflow = "";

            window.removeEventListener("wheel", preventDefault);
            window.removeEventListener("touchmove", preventDefault);
        }

        return () => {
            // Clean up everything when the component unmounts
            document.body.style.paddingRight = "";
            document.body.style.overflow = "";
            window.removeEventListener("wheel", preventDefault);
            window.removeEventListener("touchmove", preventDefault);
        };
    }, [phase]);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);

        if (isOpen && originRect) {
            if (phase === "exiting") {
                timerRef.current = setTimeout(() => {
                    setLockedRect(originRect);
                    setPhase("entering");
                    timerRef.current = setTimeout(() => setPhase("visible"), 20);
                }, 450);
            } else {
                setLockedRect(originRect);
                setPhase("entering");
                timerRef.current = setTimeout(() => setPhase("visible"), 20);
            }
        } else if (phase === "entering" || phase === "visible") {
            setPhase("exiting");
            timerRef.current = setTimeout(() => {
                setPhase("hidden");
            }, 450);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isOpen]);

    if (phase === "hidden" || !member || !lockedRect) return null;

    const modalWidth = 400;
    const modalHeight = 400;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const originCX = lockedRect.left + lockedRect.width / 2;
    const originCY = lockedRect.top + lockedRect.height / 2;

    const tx = centerX - originCX;
    const ty = centerY - originCY;

    const scaleX = lockedRect.width / modalWidth;
    const scaleY = lockedRect.height / modalHeight;
    const originScale = Math.max(scaleX, scaleY);

    const isActive = phase === "visible";
    const isExiting = phase === "exiting";

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                style={{
                    backgroundColor: isActive ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
                    transition: "background-color 450ms cubic-bezier(0.4, 0, 0.2, 1)",
                    pointerEvents: "auto",
                    cursor: "pointer",
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="fixed z-50 pointer-events-none"
                style={{
                    left: `${originCX}px`,
                    top: `${originCY}px`,
                }}
            >
                <div
                    className="absolute pointer-events-auto overflow-hidden bg-white"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: `${modalWidth}px`,
                        height: `${modalHeight}px`,
                        transform: isActive ? `translate(calc(${tx}px - 50%), calc(${ty}px - 50%)) scale(1)` : `translate(-50%, -50%) scale(${originScale})`,
                        transformOrigin: "center center",
                        transition: isExiting
                            ? "transform 450ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)"
                            : "transform 450ms cubic-bezier(0.4, 0, 0.2, 1), opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: isActive ? 1 : 0,
                        borderRadius: "4px",
                    }}
                >
                    <div className="relative w-full h-full">
                        <Image src={member.image} alt={member.name} width={modalWidth} height={modalHeight} className="object-cover w-full h-full" />
                        <div
                            className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-[92%] px-3.5 py-2 our-team-gradient"
                            style={{
                                opacity: isActive ? 1 : 0,
                                transition: "opacity 250ms ease 150ms",
                            }}
                        >
                            <h3 className="text-white font-product-sans-bold font-bold text-xl uppercase">{member.name}</h3>
                            <p className="text-white font-product-sans-light text-[16px] uppercase">{member.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
