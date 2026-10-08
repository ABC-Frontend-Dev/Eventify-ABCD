// components/layout/InspirationInFrames/InspirationInFrames.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SubHeading from "@/components/common/SubHeading";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface InstagramPost {
  id: string;
  permalink: string;
  image: string;
  caption: string | null;
  isVideo: boolean;
}

const AUTOPLAY_DELAY = 2500;

// One row, always: 3 tiles visible below lg, 4 on lg, 5 on xl and up.
// The carousel slides through up to MAX_POSTS posts.
const MAX_POSTS = 10;
const SLIDE_BASIS = "basis-1/3 lg:basis-1/4 xl:basis-1/5";

// ─── Single tile ──────────────────────────────────────────────────────────────
// Instagram-style 4:5 tile, picture fills the whole tile (object-cover).
function FrameItem({ post, index }: { post: InstagramPost; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative w-full aspect-4/5 overflow-hidden bg-slate-100"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a
        href={post.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-40"
        aria-label={post.caption ?? `Instagram post ${index + 1}`}
        draggable={false}
      />

      <Image
        src={post.image}
        alt={post.caption ?? `Inspiration frame ${index + 1}`}
        width={1000}
        height={1000}
        className="frame-image w-full h-full object-cover will-change-transform select-none"
        draggable={false}
        unoptimized
      />

      {post.isVideo && (
        <div className="absolute top-1.5 right-1.5 z-20 pointer-events-none">
          <Play className="w-4 h-4 text-white fill-white drop-shadow" />
        </div>
      )}

      <div
        className="absolute inset-0 z-10 pointer-events-none bg-black/25"
        style={{
          transform: hovered ? "translateY(0%)" : "translateY(100%)",
          transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s",
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 z-30 pointer-events-none"
        style={{
          transform: hovered
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.5)",
          opacity: hovered ? 1 : 0,
          transition: hovered
            ? "transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.3s, opacity 0.35s ease 0.3s"
            : "transform 0.25s ease 0s, opacity 0.2s ease 0s",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24">
          <path
            fill="#fff"
            d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────
function Carousel({ posts }: { posts: InstagramPost[] }) {
  const autoplayPlugin = useRef(
    Autoplay({
      delay: AUTOPLAY_DELAY,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: false,
      playOnInit: true,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: false,
      skipSnaps: false,
      containScroll: false,
      slidesToScroll: 1,
    },
    [autoplayPlugin.current],
  );

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
    autoplayPlugin.current.reset();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    autoplayPlugin.current.reset();
  }, [emblaApi]);

  // Restart autoplay after the user lets go of a drag
  useEffect(() => {
    if (!emblaApi) return;
    const onPointerUp = () => {
      setTimeout(() => autoplayPlugin.current.reset(), 50);
    };
    emblaApi.on("pointerUp", onPointerUp);
    return () => {
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);

  // Nothing to slide when every post already fits in the row
  const [canSlide, setCanSlide] = useState(true);
  useEffect(() => {
    if (!emblaApi) return;
    const update = () => setCanSlide(emblaApi.scrollSnapList().length > 1 && (emblaApi.canScrollNext() || emblaApi.canScrollPrev()));
    update();
    emblaApi.on("reInit", update);
    emblaApi.on("resize", update);
    return () => {
      emblaApi.off("reInit", update);
      emblaApi.off("resize", update);
    };
  }, [emblaApi, posts.length]);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        {/* -mx offsets the per-slide padding so the row lines up with the section edges */}
        <ul className="flex -mx-0.5 sm:-mx-0.75">
          {posts.map((post, index) => (
            <li key={post.id} className={`${SLIDE_BASIS} shrink-0 grow-0 min-w-0 px-0.5 sm:px-0.75`}>
              <FrameItem post={post} index={index} />
            </li>
          ))}
        </ul>
      </div>

      {canSlide && (
        <div className="absolute top-1/2 -translate-y-1/2 w-[105%] left-1/2 -translate-x-1/2 flex items-center justify-between pointer-events-none">
          <button
            onClick={scrollPrev}
            className="pointer-events-auto w-5 425:w-6 h-5 425:h-6 sm:w-10 sm:h-10 rounded-full bg-white/95 shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 flex items-center justify-center group/btn hover:bg-primary"
            aria-label="Previous"
          >
            <ChevronLeft className="w-3 425:w-4 h-3 425:h-4 sm:w-5 sm:h-5 text-primary group-hover/btn:text-white transition-colors duration-200" />
          </button>
          <button
            onClick={scrollNext}
            className="pointer-events-auto w-5 425:w-6 h-5 425:h-6 sm:w-10 sm:h-10 rounded-full bg-white/95 shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 flex items-center justify-center group/btn hover:bg-primary"
            aria-label="Next"
          >
            <ChevronRight className="w-3 425:w-4 h-3 425:h-4 sm:w-5 sm:h-5 text-primary group-hover/btn:text-white transition-colors duration-200" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function InspirationSkeleton() {
  return (
    <div className="flex -mx-0.5 sm:-mx-0.75 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`${SLIDE_BASIS} shrink-0 grow-0 px-0.5 sm:px-0.75 ${i === 3 ? "hidden lg:block" : ""} ${i === 4 ? "hidden xl:block" : ""}`}>
          <div className="aspect-4/5 bg-slate-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function InspirationInFrames() {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest posts from the official Instagram Graph API (via our proxy route)
  useEffect(() => {
    fetch("/api/instagram/latest")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPosts((data.data as InstagramPost[]).slice(0, MAX_POSTS));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || posts.length === 0) return;

    let ctx: gsap.Context | undefined;
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        const header = sectionRef.current?.querySelector("header");
        if (header) {
          gsap.from(header, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: header,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        }

        const carousel = carouselRef.current;
        if (!carousel) return;

        const images = carousel.querySelectorAll(".frame-image");
        if (!images.length) return;

        images.forEach((img, i) => {
          const card = img.closest("div");
          if (!card) return;

          gsap.set(card, { opacity: 0, y: 60 });
          gsap.set(img, { scale: 1.35 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: carousel,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            onComplete: () => {
              gsap.set(card, { clearProps: "all" });
              gsap.set(img, { clearProps: "all" });
            },
          });

          // only the first few tiles are on screen, so stagger just those
          const delay = Math.min(i, 5) * 0.08;
          tl.to(card, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, delay);
          tl.to(img, { scale: 1, duration: 1.2, ease: "power2.out" }, delay + 0.05);
        });
      }, sectionRef);
    }, 100);

    return () => {
      clearTimeout(timer);
      ctx?.revert();
    };
  }, [loading, posts]);

  // Don't render section at all if no posts
  if (!loading && posts.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="max-w-360 w-full mx-auto px-5 lg:px-20 pb-9 lg:py-9 scroll-mt-6 md:scroll-mt-1"
    >
      <header>
        <SubHeading sectionType="SYL" showDescription />
      </header>

      <div className="mt-4 sm:mt-7.5">
        {loading ? (
          <InspirationSkeleton />
        ) : (
          <div ref={carouselRef} className="w-full">
            <Carousel posts={posts} />
          </div>
        )}
      </div>
    </section>
  );
}