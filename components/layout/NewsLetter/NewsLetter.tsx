"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";

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
        <div className="max-w-135 w-full h-12.5">
            {/* Success state */}
            {status === "success" ? (
                <div className="flex flex-row items-center gap-3">
                    <div className="shrink-0 h-14 w-14 rounded-full bg-white/10 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="">
                        <p className="text-white font-helvetica-neue-roman text-lg font-semibold">{message}</p>
                        <p className="text-white/60 text-sm text-center">Check your inbox for a welcome email.</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row relative">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (status === "error") setStatus("idle");
                        }}
                        placeholder="Enter your email address"
                        required
                        className="flex-1 h-12 pl-12 pr-2.5 py-2.5 bg-white/10 border border-white/20 text text-white placeholder:text-white/40 placeholder:font-helvetica placeholder:text-base font-helvetica text-base focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                    />
                    <div className="absolute top-1/2 left-2.5 -translate-y-1/2">
                        <Image src="https://res.cloudinary.com/afdhm38k/image/upload/v1786517185/envelope_x3rxrl.png" alt="Mail Icon" width={30} height={30} />
                    </div>
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="h-12 px-6 bg-white text-primary font-helvetica-neue-roman font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 cursor-pointer"
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
