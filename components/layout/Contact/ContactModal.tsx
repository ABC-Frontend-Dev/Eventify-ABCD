"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
                <motion.div key="contact-modal-root" className="fixed inset-0 z-[9999] overflow-y-auto" initial="closed" animate="open" exit="closed" onClick={onClose}>
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
                                    <h2 className="text-4xl font-product-sans-regular tracking-wider font-bold uppercase leading-11 text-footer-bg">Got A Project In Mind?</h2>
                                    <h3 className="text-4xl font-product-sans-regular tracking-wider font-bold uppercase leading-11 text-primary">Get In Touch</h3>
                                    <p className="mt-1.5 text-sm font-product-sans-regular text-footer-bg md:text-lg">We're here to answer any question you may have.</p>
                                </div>

                                <h4 className="mt-10 text-xl font-bold uppercase text-black">Contact Us</h4>

                                <form className="mt-8 space-y-10">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="NAME"
                                            className="w-full border-0 border-b border-[#444] bg-transparent pb-3 text-lg uppercase outline-none placeholder:text-[#4B5C73] focus:border-[#5B1196]"
                                        />
                                    </div>

                                    <div>
                                        <input
                                            type="email"
                                            placeholder="EMAIL"
                                            className="w-full border-0 border-b border-[#444] bg-transparent pb-3 text-lg uppercase outline-none placeholder:text-[#4B5C73] focus:border-[#5B1196]"
                                        />
                                    </div>

                                    <div>
                                        <input
                                            type="tel"
                                            placeholder="PHONE"
                                            className="w-full border-0 border-b border-[#444] bg-transparent pb-3 text-lg uppercase outline-none placeholder:text-[#4B5C73] focus:border-[#5B1196]"
                                        />
                                    </div>

                                    <div>
                                        <textarea
                                            rows={1}
                                            placeholder="MESSAGE"
                                            className="w-full resize-none border-0 border-b border-[#444] bg-transparent pb-3 text-lg uppercase outline-none placeholder:text-[#4B5C73] focus:border-[#5B1196]"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-4 flex h-[72px] w-full items-center justify-center rounded-full bg-[#252525] text-xl font-bold uppercase text-white transition hover:opacity-90"
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
