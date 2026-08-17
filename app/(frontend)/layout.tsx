// app/(frontend)/layout.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Navbar from "@/components/layout/navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";
import { LenisHashHandler } from "@/components/layout/LenisHashHandler/LenisHashHandler";

gsap.registerPlugin(ScrollTrigger);

function LenisScrollTriggerSync() {
    const lenis = useLenis();

    useEffect(() => {
        if (!lenis) return;

        window.__lenis = lenis;

        // Keep ScrollTrigger in sync with Lenis scroll events.
        lenis.on("scroll", ScrollTrigger.update);

        // ONE raf loop total (ReactLenis has autoRaf={false}, see below).
        const update = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(update); // ✅ same reference → actually removes it
            lenis.off("scroll", ScrollTrigger.update);
            if (window.__lenis === lenis) window.__lenis = undefined;
        };
    }, [lenis]);

    return null;
}

function RouteChangeScrollSync() {
    const pathname = usePathname();

    useEffect(() => {
        // Don't scroll to top when we're about to jump to a section hash.
        if (window.__pendingHash || window.location.hash) return;

        window.__lenis?.scrollTo(0, { immediate: true });

        const raf = requestAnimationFrame(() => {
            ScrollTrigger.refresh();
        });

        return () => cancelAnimationFrame(raf);
    }, [pathname]);

    return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ReactLenis className="cursor-none" root autoRaf={false} options={{ smoothWheel: true, lerp: 0.1 }}>
            <LenisHashHandler />
            <LenisScrollTriggerSync />
            <RouteChangeScrollSync />
            <Navbar />
            <main>{children}</main>
            <Footer />
        </ReactLenis>
    );
}
