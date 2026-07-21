"use client";

interface SkeletonSlotConfig {
    position: number;
    className: string;
}

// Mirrors SLOT_LAYOUT from Teams.tsx exactly (positions + className only).
// If you move SLOT_LAYOUT to a shared file, import it here instead of duplicating.
const SKELETON_SLOT_LAYOUT: SkeletonSlotConfig[] = [
    { position: 1, className: "" },
    { position: 2, className: "col-start-1 row-start-2" },
    { position: 3, className: "col-start-1 row-start-4" },
    { position: 4, className: "col-span-2 row-span-2 col-start-1 row-start-5" },
    { position: 5, className: "col-start-2 row-start-1" },
    { position: 6, className: "col-start-2 row-start-2 translate-y-9" },
    { position: 7, className: "col-start-2 row-start-3 translate-y-9" },
    { position: 8, className: "col-start-3 row-start-2" },
    { position: 9, className: "col-start-3 row-start-3" },
    { position: 10, className: "col-start-3 row-start-4" },
    { position: 11, className: "col-start-3 row-start-5" },
    { position: 12, className: "col-start-4 row-start-1" },
    { position: 13, className: "col-start-4 row-start-2" },
    { position: 14, className: "col-span-3 row-span-3 col-start-4 row-start-3 translate-y-9" },
    { position: 15, className: "col-start-4 row-start-7" },
    { position: 16, className: "col-start-5 row-start-1" },
    { position: 17, className: "col-start-5 row-start-2 translate-y-9" },
    { position: 18, className: "col-start-5 row-start-7" },
    { position: 19, className: "col-start-6 row-start-2 translate-y-9" },
    { position: 20, className: "col-start-6 row-start-7" },
    { position: 21, className: "col-start-7 row-start-1" },
    { position: 22, className: "col-span-2 row-span-2 col-start-7 row-start-3" },
    { position: 23, className: "col-start-7 row-start-5" },
    { position: 24, className: "col-start-7 row-start-6" },
    { position: 25, className: "col-start-8 row-start-1" },
    { position: 26, className: "col-start-8 row-start-2" },
    { position: 27, className: "col-start-8 row-start-5" },
    { position: 28, className: "col-span-2 row-span-2 col-start-8 row-start-6" },
    { position: 29, className: "col-start-9 row-start-2" },
    { position: 30, className: "col-start-9 row-start-3" },
    { position: 31, className: "col-span-2 row-span-2 col-start-9 row-start-4" },
    { position: 32, className: "col-start-10 row-start-1" },
    { position: 33, className: "col-start-10 row-start-3" },
    { position: 34, className: "col-start-10 row-start-6" },
    { position: 35, className: "col-start-10 row-start-7" },
];

function SkeletonItem({ className = "" }: { className?: string }) {
    return (
        <div className={`${className} aspect-square overflow-hidden`}>
            <div className="w-full h-full bg-gray-200 animate-pulse" />
        </div>
    );
}

export default function TeamsSkeleton() {
    return (
        <div className="relative hidden lg:grid grid-cols-10 grid-rows-7 gap-x-1.5 gap-y-1">
            {SKELETON_SLOT_LAYOUT.map((slot) => (
                <SkeletonItem key={slot.position} className={slot.className} />
            ))}
        </div>
    );
}
