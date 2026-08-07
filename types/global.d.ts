import type Lenis from "lenis";

declare global {
    interface Window {
        /**
         * Live Lenis instance, exposed by LenisScrollTriggerSync so any
         * non-React code (e.g. HeroPageLoader's GSAP onComplete callback)
         * can drive the smooth scroller without depending on a stale
         * useLenis() snapshot captured before unmount.
         */
        __lenis?: Lenis;

        /**
         * Stash the target hash before cross-page navigation; consumed by
         * HeroPageLoader on the destination page once its intro finishes.
         */
        __pendingHash?: string;
    }
}

export {};
