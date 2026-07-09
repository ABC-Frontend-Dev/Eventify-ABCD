// components/layout/Contact/ContactModal.tsx
"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { useToasts } from "@/components/ui/toast";

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
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    name: string;
}

function AnimatedField({ label, type = "text", as = "input", rows = 3, value, onChange, name }: FieldProps) {
    const id = useId();
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [showHoverUnderline, setShowHoverUnderline] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const active = focused || value.length > 0;

    const handleHoverStart = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setHovered(true);
        setShowHoverUnderline(true);
    };

    const handleHoverEnd = () => {
        setHovered(false);
        hoverTimeoutRef.current = setTimeout(() => {
            setShowHoverUnderline(false);
        }, 200);
    };

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

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
                        name={name}
                        rows={rows}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="relative z-[1] w-full resize-none border-0 bg-transparent pb-1 pt-4 text-lg font-product-sans-regular text-slate-950 outline-none"
                    />
                ) : (
                    <input
                        id={id}
                        name={name}
                        type={type}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="relative z-[1] w-full border-0 bg-transparent pt-5 text-lg leading-5 font-product-sans-regular text-slate-950 outline-none"
                    />
                )}

                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-footer-bg/10" />

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
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useToasts();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setTimeout(() => {
                setFormData({ name: "", email: "", phone: "", message: "" });
                setSubmitted(false);
            }, 300);
            return;
        }

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
            toast.warning("Please fill in all fields");
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch("/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                setSubmitted(true);
                toast.success("Thank you! We'll get back to you soon.");
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                toast.error(result.error || "Failed to submit form. Please try again.");
            }
        } catch (error) {
            console.error("Contact form error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div key="contact-modal-root" className="fixed inset-0 z-[999] overflow-y-auto" initial="closed" animate="open" exit="closed" onClick={onClose}>
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
                        variants={{
                            open: { opacity: 1 },
                            closed: { opacity: 0 },
                        }}
                        transition={{ duration: 0.22, ease: easeOut }}
                    />

                    <div className="relative flex min-h-[100dvh] items-start justify-center p-4 py-6 md:items-center md:p-6">
                        <motion.div
                            layoutId="contact-modal-shell"
                            transition={{ layout: morphTransition }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-[850px] overflow-hidden rounded-[28px] bg-[#F4F4F4] shadow-[0_20px_70px_rgba(0,0,0,0.20)] ring-1 ring-black/5 will-change-transform"
                        >
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(255,255,255,0)_45%)]" />

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

                            <motion.div
                                initial={{ opacity: 0, scale: 0.985, filter: "blur(8px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.985, filter: "blur(4px)" }}
                                transition={{ duration: 0.2, ease: easeOut }}
                                className="relative px-8 py-10 md:px-12.5"
                            >
                                {submitted ? (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-12 text-center">
                                        <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
                                        <h3 className="text-3xl font-product-sans-regular font-bold text-primary mb-2">Thank You!</h3>
                                        <p className="text-lg text-footer-bg">We've received your message and will get back to you soon.</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div>
                                            <h3 className="text-4xl font-product-sans-regular tracking-wider font-bold uppercase leading-11 text-primary">Get In Touch</h3>
                                            <h2 className="text-4xl font-product-sans-regular tracking-wider font-bold uppercase leading-11 text-footer-bg">Got A Project In Mind?</h2>
                                            <p className="text-sm font-product-sans-regular text-footer-bg md:text-lg">We're here to answer any question you may have.</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="mt-7.5 space-y-2">
                                            <AnimatedField label="NAME" type="text" name="name" value={formData.name} onChange={handleChange} />
                                            <AnimatedField label="EMAIL" type="email" name="email" value={formData.email} onChange={handleChange} />
                                            <AnimatedField label="PHONE" type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                                            <AnimatedField label="MESSAGE" as="textarea" rows={3} name="message" value={formData.message} onChange={handleChange} />

                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="mt-4 flex h-18 w-full items-center justify-center rounded-full bg-[#252525] font-helvetica-medium text-xl font-bold uppercase text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    "Submit"
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
