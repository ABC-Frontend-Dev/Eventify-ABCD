"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

interface TeamModalFlipProps {
    member: {
        id: number;
        name: string;
        role: string;
        image: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
    originRect: DOMRect | null;
}

export default function TeamModalFlip({ member, isOpen, onClose, originRect }: TeamModalFlipProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsFlipped(false);
        }
    }, [isOpen]);

    if (!member) return null;

    const modalWidth = 500;
    const modalHeight = 600;

    const startX = originRect ? originRect.left + originRect.width / 2 - modalWidth / 2 : 0;
    const startY = originRect ? originRect.top + originRect.height / 2 - modalHeight / 2 : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div className="fixed inset-0 bg-black/50 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} transition={{ duration: 0.3 }} />

                    {/* Modal Container */}
                    <motion.div
                        className="fixed top-1/2 left-1/2 w-[500px] h-[600px] z-50"
                        initial={{
                            x: startX - window.innerWidth / 2,
                            y: startY - window.innerHeight / 2,
                            opacity: 0,
                        }}
                        animate={{
                            x: 0,
                            y: 0,
                            opacity: 1,
                        }}
                        exit={{
                            x: startX - window.innerWidth / 2,
                            y: startY - window.innerHeight / 2,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                        }}
                        style={{
                            transformOrigin: "center center",
                            marginLeft: "-250px",
                            marginTop: "-300px",
                        }}
                        onMouseEnter={() => setIsFlipped(true)}
                        onMouseLeave={() => setIsFlipped(false)}
                    >
                        {/* 3D Flip Container */}
                        <motion.div
                            className="relative w-full h-full"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            style={{
                                transformStyle: "preserve-3d",
                                perspective: 1200,
                            }}
                        >
                            {/* Front Side - Image Only */}
                            <motion.div
                                className="absolute inset-0 bg-white rounded-lg shadow-2xl overflow-hidden"
                                style={{
                                    backfaceVisibility: "hidden",
                                    WebkitBackfaceVisibility: "hidden",
                                }}
                            >
                                <Image src={member.image} alt={member.name} fill className="w-full h-full object-cover" />
                            </motion.div>

                            {/* Back Side - Image with Text Overlay */}
                            <motion.div
                                className="absolute inset-0 bg-white rounded-lg shadow-2xl overflow-hidden"
                                style={{
                                    backfaceVisibility: "hidden",
                                    WebkitBackfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                }}
                            >
                                {/* Background Image */}
                                <Image src={member.image} alt={member.name} fill className="w-full h-full object-cover" />

                                {/* Dark Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

                                {/* Text Content */}
                                <div className="absolute inset-0 flex flex-col justify-between p-8 text-white">
                                    {/* Top Section */}
                                    <div>
                                        <h2 className="text-3xl font-bold font-helvetica mb-2 uppercase tracking-wide">{member.name}</h2>
                                        <p className="text-lg font-light font-helvetica uppercase tracking-widest text-gray-200">{member.role}</p>
                                        <div className="w-12 h-1 bg-white mt-4 mb-6"></div>
                                    </div>

                                    {/* Middle Section */}
                                    <div className="text-sm font-light space-y-4 leading-relaxed">
                                        <p>Passionate about creating unforgettable moments and experiences in the event industry.</p>
                                        <p>Dedicated to excellence and innovation in every project we undertake.</p>
                                    </div>

                                    {/* Bottom Section */}
                                    <button
                                        onClick={onClose}
                                        className="py-3 px-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all duration-300 uppercase font-semibold text-sm border border-white/20 hover:border-white/40"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
