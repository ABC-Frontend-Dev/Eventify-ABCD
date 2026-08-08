"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Mail } from "lucide-react";

export default function NewsLetter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) return;

        setStatus("loading");

        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });

            const result = await res.json();

            if (result.success) {
                setStatus("success");
                setMessage(result.message);
                setEmail("");
            } else {
                setStatus("error");
                setMessage(result.error || "Something went wrong.");
            }
        } catch {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    return (
        <section className="max-w-360 w-full mx-auto px-5 lg:px-20 py-9 scroll-mt-14">
            <div className="bg-primary rounded-2xl px-8 py-12 md:px-16 md:py-16 text-center">
                {/* Icon */}
                <div className="flex items-center justify-center mb-5">
                    <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center">
                        <Mail className="h-7 w-7 text-white" />
                    </div>
                </div>

                {/* Heading */}
                <h2 className="text-2xl md:text-4xl font-helvetica-bold font-bold text-white leading-tight mb-3">Stay in the Loop</h2>
                <p className="text-white/75 font-helvetica text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
                    Subscribe to our newsletter and be the first to know about events, awards, and everything happening at Eventify.
                </p>

                {/* Success state */}
                {status === "success" ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-white font-helvetica-neue-roman text-lg font-semibold">{message}</p>
                        <p className="text-white/60 text-sm">Check your inbox for a welcome email.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (status === "error") setStatus("idle");
                            }}
                            placeholder="Enter your email address"
                            required
                            className="flex-1 h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-helvetica-neue-roman text-sm focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="h-12 px-6 rounded-lg bg-white text-primary font-helvetica-neue-roman font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
                        >
                            {status === "loading" ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Subscribing…
                                </>
                            ) : (
                                "Subscribe"
                            )}
                        </button>
                    </form>
                )}

                {/* Error message */}
                {status === "error" && <p className="mt-3 text-sm text-red-200 font-helvetica-neue-roman">{message}</p>}

                {/* Privacy note */}
                {status !== "success" && <p className="mt-4 text-white/40 text-xs font-helvetica-neue-roman">No spam, ever. Unsubscribe at any time.</p>}
            </div>
        </section>
    );
}
