// app/(frontend)/layout.tsx
"use client";
import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Navbar from "@/components/layout/navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ReactLenis root options={{ smoothWheel: true, lerp: 0.1 }}>
            <LenisScrollTriggerSync />
            <Navbar />
            {children}
            {/* <Footer /> */}
        </ReactLenis>
    );
}
