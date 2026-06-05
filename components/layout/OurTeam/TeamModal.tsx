// components/layout/OurTeam/TeamModal.tsx
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

export default function TeamModal({ member, isOpen, onClose, originRect }: TeamModalProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setShowOverlay(true);
            // Small delay to ensure smooth animation
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            // Wait for animation to complete before hiding overlay
            setTimeout(() => {
                setShowOverlay(false);
                document.body.style.overflow = "unset";
            }, 500);
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!member || !originRect) return null;

    // Fixed dimensions
    const modalWidth = 400;
    const modalHeight = 400;

    // Calculate center position
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Calculate initial position (from grid) - center of the grid item
    const initialX = originRect.left + originRect.width / 2;
    const initialY = originRect.top + originRect.height / 2;

    // Calculate translation needed to move to center
    const translateX = isAnimating ? centerX - initialX : 0;
    const translateY = isAnimating ? centerY - initialY : 0;

    return (
        <>
            {/* Dark overlay */}
            {showOverlay && (
                <div
                    className="fixed inset-0 z-40 bg-black w-full h-screen transition-all duration-500"
                    style={{
                        backgroundColor: isAnimating ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0)",
                    }}
                    onClick={onClose}
                />
            )}

            {/* Modal content */}
            {showOverlay && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: `${initialX}px`,
                        top: `${initialY}px`,
                    }}
                >
                    <div
                        className="absolute transition-all duration-500 ease-in-out"
                        style={{
                            transform: `translate(${translateX}px, ${translateY}px) translate(-50%, -50%)`,
                            transformOrigin: "center center",
                            width: `${modalWidth}px`,
                            height: `${modalHeight}px`,
                        }}
                    >
                        <div
                            className="bg-white overflow-hidden pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                        >
                            <div className="relative w-full h-full">
                                <Image src={member.image} alt={member.name} width={modalWidth} height={modalHeight} className="object-cover w-full h-full" />
                                <div
                                    className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-[92%] h-fit px-3.5 py-2 our-team-gradient"
                                    style={{
                                        opacity: isAnimating ? 1 : 0,
                                    }}
                                >
                                    <h3 className="text-white font-product-sans-bold font-bold text-xl uppercase">{member.name}</h3>
                                    <p className="text-white font-product-sans-light text-[16px] uppercase">{member.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
