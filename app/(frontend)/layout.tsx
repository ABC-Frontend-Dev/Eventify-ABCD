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

// Window globals (__lenis, __pendingHash) are declared in /types/global.d.ts

gsap.registerPlugin(ScrollTrigger);

function LenisScrollTriggerSync() {
    const lenis = useLenis(({ scroll }) => {
        ScrollTrigger.update();
    });

    useEffect(() => {
        if (!lenis) return;
        // Expose the live instance so HeroPageLoader can read it on demand
        // (useLenis inside a top-level handler can be stale or undefined).
        window.__lenis = lenis;

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove((time) => lenis.raf(time * 1000));
            // Only clear if we're still the active instance, otherwise we'd
            // wipe a fresh instance mounted by a re-render.
            if (window.__lenis === lenis) window.__lenis = undefined;
        };
    }, [lenis]);

    return null;
}

function RouteChangeScrollSync() {
    const pathname = usePathname();

    useEffect(() => {
        // If the user clicked a navbar item on another page, do NOT scroll
        // to top — HeroPageLoader will handle the jump to the hash once
        // its intro animation finishes and the page is interactive.
        if (window.__pendingHash) return;

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
        <ReactLenis className="cursor-none" root options={{ smoothWheel: true, lerp: 0.1 }}>
            <LenisHashHandler />
            <LenisScrollTriggerSync />
            <RouteChangeScrollSync />
            <Navbar />
            <main>{children}</main>
            <Footer />
        </ReactLenis>
    );
}
