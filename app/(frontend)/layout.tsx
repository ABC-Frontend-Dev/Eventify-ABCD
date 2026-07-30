"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Navbar from "@/components/layout/navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";
import { SmoothCursor } from "@/components/ui/smooth-cursor";

gsap.registerPlugin(ScrollTrigger);

function LenisScrollTriggerSync() {
    const lenis = useLenis(({ scroll }) => {
        ScrollTrigger.update();
    });

    useEffect(() => {
        gsap.ticker.add((time) => {
            lenis?.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove((time) => lenis?.raf(time * 1000));
        };
    }, [lenis]);

    return null;
}

// Keeps Lenis's virtual scroll position and ScrollTrigger's cached trigger
// positions in sync with the freshly-mounted page after client-side navigation.
// Without this, Lenis keeps whatever scroll offset it had on the previous page,
// while the new page's DOM (and its ScrollTrigger instances) mount fresh at the
// top — the mismatch is what causes the janky/stuck animations on navigating back.
function RouteChangeScrollSync() {
    const pathname = usePathname();
    const lenis = useLenis();

    useEffect(() => {
        // Snap Lenis back to top immediately, before the new page paints.
        lenis?.scrollTo(0, { immediate: true });

        // Wait for the new page's layout (images, GSAP gsap.set hidden-states, etc.)
        // to settle before asking ScrollTrigger to recalculate trigger start/end
        // positions — otherwise it can measure against a not-yet-final layout.
        const raf = requestAnimationFrame(() => {
            ScrollTrigger.refresh();
        });

        return () => cancelAnimationFrame(raf);
    }, [pathname, lenis]);

    return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ReactLenis className="cursor-none" root options={{ smoothWheel: true, lerp: 0.1 }}>
            <LenisScrollTriggerSync />
            <RouteChangeScrollSync />
            <Navbar />
            <main>{children}</main>
            {/* <SmoothCursor /> */}
            <Footer />
        </ReactLenis>
    );
}
