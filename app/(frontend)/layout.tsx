"use client";

import { useEffect, useRef } from "react";
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
        lenis.on("scroll", ScrollTrigger.update);

        const update = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(update);
            lenis.off("scroll", ScrollTrigger.update);
            if (window.__lenis === lenis) window.__lenis = undefined;
        };
    }, [lenis]);

    return null;
}

// ─── Scroll position memory ───────────────────────────────────────────────────

const SCROLL_STORE_KEY = "eventify:scroll-positions";
const RESTORE_TIMEOUT_MS = 4000;

function loadPositions(): Record<string, number> {
    try {
        return JSON.parse(sessionStorage.getItem(SCROLL_STORE_KEY) ?? "{}");
    } catch {
        return {};
    }
}

function savePositions(positions: Record<string, number>) {
    try {
        sessionStorage.setItem(SCROLL_STORE_KEY, JSON.stringify(positions));
    } catch {
        /* private mode — ignore */
    }
}

function jumpTo(y: number) {
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
}

/**
 * Waits until the page is tall enough (sections fetch their data async, so
 * the height grows after mount), jumps to `target`, then re-checks once in
 * case images/fonts shifted the layout. Any user input cancels the restore.
 *
 * Returns `stop()` — tears everything down WITHOUT calling `onDone`.
 */
function startRestore(target: number, onDone: () => void): () => void {
    let raf = 0;
    let verifyTimer: ReturnType<typeof setTimeout> | undefined;
    let finished = false;
    const startedAt = performance.now();

    function cleanup() {
        finished = true;
        cancelAnimationFrame(raf);
        if (verifyTimer) clearTimeout(verifyTimer);
        window.removeEventListener("wheel", onUserInput);
        window.removeEventListener("touchstart", onUserInput);
        window.removeEventListener("keydown", onUserInput);
    }

    function finish() {
        if (finished) return;
        cleanup();
        onDone();
    }

    function onUserInput() {
        finish();
    }

    window.addEventListener("wheel", onUserInput, { passive: true });
    window.addEventListener("touchstart", onUserInput, { passive: true });
    window.addEventListener("keydown", onUserInput);

    const maxScrollNow = () => document.documentElement.scrollHeight - window.innerHeight;

    const tick = () => {
        if (finished) return;

        const ready = maxScrollNow() >= target - 2;
        const timedOut = performance.now() - startedAt > RESTORE_TIMEOUT_MS;

        if (ready || timedOut) {
            jumpTo(Math.min(target, Math.max(0, maxScrollNow())));
            ScrollTrigger.refresh();

            verifyTimer = setTimeout(() => {
                if (finished) return;
                const y = Math.min(target, Math.max(0, maxScrollNow()));
                if (Math.abs(window.scrollY - y) > 2) jumpTo(y);
                finish();
            }, 400);
            return;
        }

        raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return cleanup;
}

function RouteScrollManager() {
    const pathname = usePathname();
    const positions = useRef<Record<string, number>>({});
    const pathRef = useRef(pathname);
    // While true, scroll events are NOT recorded (a route change is in flight,
    // and Next/Lenis resetting to 0 must not overwrite the saved position).
    const frozenRef = useRef(false);
    // True when the next route change came from back/forward (or a reload).
    const pendingRestoreRef = useRef(false);
    const stopRestoreRef = useRef<(() => void) | null>(null);

    // ── One-time setup ───────────────────────────────────────────────────────
    useEffect(() => {
        const prevRestoration = history.scrollRestoration;
        history.scrollRestoration = "manual"; // we own scroll restoration now
        positions.current = loadPositions();

        // Reload, or back/forward arriving from outside the app (full page load)
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        if ((nav?.type === "reload" || nav?.type === "back_forward") && !window.location.hash) {
            pendingRestoreRef.current = true;
            frozenRef.current = true;
        }

        const onScroll = () => {
            if (!frozenRef.current) positions.current[pathRef.current] = window.scrollY;
        };

        // If the route never actually changes (e.g. hash-only history entry),
        // un-freeze again so scroll recording resumes.
        const unfreezeIfStill = (pathAtStart: string) => {
            window.setTimeout(() => {
                if (pathRef.current === pathAtStart) {
                    pendingRestoreRef.current = false;
                    frozenRef.current = false;
                    positions.current[pathRef.current] = window.scrollY;
                }
            }, 1500);
        };

        const onClick = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const anchor = (e.target as HTMLElement).closest?.("a");
            if (!anchor || anchor.target === "_blank") return;

            let url: URL;
            try {
                url = new URL(anchor.href, window.location.href);
            } catch {
                return;
            }
            if (url.origin !== window.location.origin) return;
            if (url.pathname === window.location.pathname) return; // same page → no route change

            // A normal link click is a NEW visit, not a back navigation
            pendingRestoreRef.current = false;
            if (!frozenRef.current) positions.current[pathRef.current] = window.scrollY;
            frozenRef.current = true;
            unfreezeIfStill(pathRef.current);
        };

        const onPopState = () => {
            if (!frozenRef.current) positions.current[pathRef.current] = window.scrollY;
            pendingRestoreRef.current = true;
            frozenRef.current = true;
            unfreezeIfStill(pathRef.current);
        };

        const onPageHide = () => {
            if (!frozenRef.current) positions.current[pathRef.current] = window.scrollY;
            savePositions(positions.current);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("click", onClick, true); // capture: runs before navigation
        window.addEventListener("popstate", onPopState);
        window.addEventListener("pagehide", onPageHide);

        return () => {
            window.removeEventListener("scroll", onScroll);
            document.removeEventListener("click", onClick, true);
            window.removeEventListener("popstate", onPopState);
            window.removeEventListener("pagehide", onPageHide);
            history.scrollRestoration = prevRestoration;
        };
    }, []);

    // ── On every route change ────────────────────────────────────────────────
    useEffect(() => {
        pathRef.current = pathname;
        savePositions(positions.current);

        if (pendingRestoreRef.current) {
            const target = positions.current[pathname];

            if (target && target > 0) {
                frozenRef.current = true;
                stopRestoreRef.current?.();
                stopRestoreRef.current = startRestore(target, () => {
                    pendingRestoreRef.current = false;
                    frozenRef.current = false;
                    stopRestoreRef.current = null;
                });
                return () => stopRestoreRef.current?.();
            }

            // Nothing saved for this page → treat it like a normal visit
            pendingRestoreRef.current = false;
        }

        frozenRef.current = false;

        // Navbar hash navigation owns the scroll (LenisHashHandler / loader)
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
            <RouteScrollManager />
            <Navbar />
            <main>{children}</main>
            <Footer />
        </ReactLenis>
    );
}