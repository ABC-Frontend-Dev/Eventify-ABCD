"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const morphTransition = {
    type: "spring" as const,
    stiffness: 380,
    damping: 38,
    mass: 0.9,
    bounce: 0,
};

const easeOut = [0.22, 1, 0.36, 1] as const;

interface FieldProps {
    label: string;
    type?: React.HTMLInputTypeAttribute;
    as?: "input" | "textarea";
    rows?: number;
}

function AnimatedField({ label, type = "text", as = "input", rows = 3 }: FieldProps) {
    const id = useId();
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [showHoverUnderline, setShowHoverUnderline] = useState(false);
    const [value, setValue] = useState("");
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const active = focused || value.length > 0;

    // Handle hover start
    const handleHoverStart = () => {
        // Clear any pending hide timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        setHovered(true);
        setShowHoverUnderline(true);
    };

    // Handle hover end with delay
    const handleHoverEnd = () => {
        setHovered(false);

        // Set timeout to hide underline after 1 second
        hoverTimeoutRef.current = setTimeout(() => {
            setShowHoverUnderline(false);
        }, 200); // 1 second delay
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    // If field becomes active (focused or filled), immediately hide hover underline
    useEffect(() => {
        if (active) {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
            }
            setShowHoverUnderline(false);
        }
    }, [active]);

    return (
        <motion.div className="group relative" whileHover={{ y: 0 }} transition={{ duration: 0.2, ease: easeOut }} onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd}>
            <div className="relative pb-2">
                <motion.label
                    htmlFor={id}
                    initial={false}
                    animate={{
                        y: active ? -26 : 0,
                        scale: active ? 0.78 : 1,
                        color: focused ? "#5B1196" : active ? "#334155" : "#475569",
                    }}
                    transition={{ duration: 0.18, ease: easeOut }}
                    className="pointer-events-none absolute left-1 top-5 origin-left text-xl font-product-sans-regular uppercase tracking-wide"
                >
                    {label}
                </motion.label>

                {as === "textarea" ? (
                    <textarea
                        id={id}
                        rows={rows}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="relative z-[1] w-full resize-none border-0 bg-transparent pb-1 pt-4 text-lg font-product-sans-regular text-slate-950 outline-none"
                    />
                ) : (
                    <input
                        id={id}
                        type={type}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="relative z-[1] w-full border-0 bg-transparent pt-5 text-lg leading-5 font-product-sans-regular text-slate-950 outline-none"
                    />
                )}

                {/* Base line */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-footer-bg/10" />

                {/* Hover underline with delayed disappearance */}
                <motion.span
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-footer-bg"
                    initial={false}
                    animate={{
                        scaleX: !active && showHoverUnderline ? 1 : 0,
                        opacity: !active && showHoverUnderline ? 1 : 0,
                    }}
                    transition={{
                        duration: showHoverUnderline ? 0.3 : 0.4,
                        ease: "easeInOut",
                    }}
                    style={{
                        transformOrigin: showHoverUnderline ? "left" : "right",
                    }}
                />

                {/* Focus / filled underline */}
                <motion.span
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                    initial={false}
                    animate={{
                        scaleX: active ? 1 : 0,
                        opacity: active ? 1 : 0,
                    }}
                    transition={{ duration: 0.22, ease: easeOut }}
                    style={{ transformOrigin: "left" }}
                />

                {/* Optional subtle focus glow */}
                <motion.div
                    initial={false}
                    animate={{
                        opacity: focused ? 1 : 0,
                    }}
                    transition={{ duration: 0.8, ease: easeOut }}
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[10px] bg-primary/10 blur-md"
                />
            </div>
        </motion.div>
    );
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div key="contact-modal-root" className="fixed inset-0 z-[999] overflow-y-auto" initial="closed" animate="open" exit="closed" onClick={onClose}>
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
                        variants={{
                            open: { opacity: 1 },
                            closed: { opacity: 0 },
                        }}
                        transition={{ duration: 0.22, ease: easeOut }}
                    />

                    {/* Modal positioning layer */}
                    <div className="relative flex min-h-[100dvh] items-start justify-center p-4 py-6 md:items-center md:p-6">
                        <motion.div
                            layoutId="contact-modal-shell"
                            transition={{ layout: morphTransition }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-[850px] overflow-hidden rounded-[28px] bg-[#F4F4F4] shadow-[0_20px_70px_rgba(0,0,0,0.20)] ring-1 ring-black/5 will-change-transform"
                        >
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(255,255,255,0)_45%)]" />

                            {/* Close button */}
                            <motion.button
                                type="button"
                                onClick={onClose}
                                aria-label="Close contact modal"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.18, ease: easeOut }}
                                className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-black shadow-sm backdrop-blur-md transition hover:bg-white md:right-6 md:top-6"
                            >
                                <X className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.8} />
                            </motion.button>

                            {/* Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.985, filter: "blur(8px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.985, filter: "blur(4px)" }}
                                transition={{ duration: 0.2, ease: easeOut }}
                                className="relative px-8 py-10 md:px-12.5"
                            >
                                <div>
                                    <h3 className="text-4xl font-product-sans-regular tracking-wider font-bold uppercase leading-11 text-primary">Get In Touch</h3>
                                    <h2 className="text-4xl font-product-sans-regular tracking-wider font-bold uppercase leading-11 text-footer-bg">Got A Project In Mind?</h2>
                                    <p className="text-sm font-product-sans-regular text-footer-bg md:text-lg">We're here to answer any question you may have.</p>
                                </div>

                                <form className="mt-7.5 space-y-2">
                                    <AnimatedField label="NAME" type="text" />
                                    <AnimatedField label="EMAIL" type="email" />
                                    <AnimatedField label="PHONE" type="tel" />
                                    <AnimatedField label="MESSAGE" as="textarea" rows={3} />

                                    <button
                                        type="submit"
                                        className="mt-4 flex h-18 w-full items-center justify-center rounded-full bg-[#252525] font-helvetica-medium text-xl font-bold uppercase text-white transition hover:opacity-90"
                                    >
                                        Submit
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
