"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function NewsLetter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    // ── Auto-reset success after 4 seconds ────────────────────────────────────
    useEffect(() => {
        if (status !== "success") return;
        const timer = setTimeout(() => {
            setStatus("idle");
            setMessage("");
        }, 4000);
        return () => clearTimeout(timer);
    }, [status]);

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
        <div className="w-full h-10 md:h-12.5 max-w-full md:max-w-full xl:max-w-md">
            {/* Success state */}
            {status === "success" ? (
                <div className="flex flex-row items-center md:justify-end gap-1.5 md:gap-3">
                    <div className="shrink-0 h-8 md:h-10 lg:h-14 w-8 md:w-10 lg:w-14 rounded-full bg-white/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 md:h-6.5 lg:h-8 w-5 md:w-6.5 lg:w-8 text-white" />
                    </div>
                    <div>
                        <p className="text-white font-helvetica md:font-helvetica-neue-roman text-xs md:text-base lg:text-lg font-semibold">{message}</p>
                        <p className="text-white/60 text-xs md:text-sm text-center">Check your inbox for a welcome email.</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-row sm:flex-row relative">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (status === "error") setStatus("idle");
                        }}
                        placeholder="Enter your email address"
                        required
                        className="flex-1 w-full h-10 md:h-10 xl:h-12 pl-8 md:pl-12 pr-2.5 py-2.5 bg-white/10 border border-white/20 text-white placeholder:text-white/40 placeholder:font-helvetica placeholder:text-sm md:placeholder:text-base font-helvetica text-sm md:text-base focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                    />
                    <div className="absolute top-1/2 left-2.5 -translate-y-1/2">
                        <Image
                            src="https://res.cloudinary.com/afdhm38k/image/upload/v1786517185/envelope_x3rxrl.png"
                            alt="Mail Icon"
                            width={1000}
                            height={1000}
                            className="h-4 sm:h-6 lg:h-7.5 w-4 sm:w-6 lg:w-7.5"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="h-10 md:h-10 xl:h-12 px-3 md:px-4 lg:px-6 bg-white text-primary font-helvetica-neue-roman font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 cursor-pointer"
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
        </div>
    );
}
