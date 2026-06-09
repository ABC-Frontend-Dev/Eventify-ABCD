import HeaderDescription from "@/components/common/HeaderDescription";
import Image from "next/image";
import SubHeading from "@/components/common/SubHeading";

export default function InspirationInFrames() {
    const items = Array.from({ length: 5 });

    return (
        <section className="max-w-360 w-full mx-auto px-5 lg:px-20 pt-9 lg:py-9">
            <header>
                <SubHeading title="Inspiration in Frames" />
                <HeaderDescription description="A curated glimpse into our visual world" scrollContainerRef={undefined} />
            </header>

            <div className="mt-7.5">
                {/* ── Desktop: single 5-column row ─────────────────────── */}
                <ul className="hidden lg:grid lg:grid-cols-5 gap-1.5">
                    {items.map((_, index) => (
                        <FrameItem key={index} index={index} />
                    ))}
                </ul>

                {/* ── Mobile / tablet: row-1 = 2 cols, row-2 = 3 cols ──── */}
                <div className="flex flex-col gap-1.5 lg:hidden">
                    {/* Row 1 — 2 columns */}
                    <ul className="grid grid-cols-2 gap-1.5">
                        {items.slice(0, 2).map((_, index) => (
                            <FrameItem key={index} index={index} tall />
                        ))}
                    </ul>

                    {/* Row 2 — 3 columns */}
                    <ul className="grid grid-cols-3 gap-1.5">
                        {items.slice(2).map((_, index) => (
                            <FrameItem key={index + 2} index={index + 2} />
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

/* ── Shared card ─────────────────────────────────────────────── */
interface FrameItemProps {
    index: number;
    tall?: boolean; // row-1 items get a bit more height on mobile
}

function FrameItem({ index, tall = false }: FrameItemProps) {
    return (
        <li
            className={[
                "w-full flex items-center justify-center group relative overflow-hidden cursor-pointer",
                "hover:after:absolute hover:after:top-0 hover:after:left-0",
                "hover:after:w-full hover:after:h-full hover:after:bg-black/60",
                "transition-all duration-300",
                // desktop always 350px tall; mobile row-1 taller, row-2 shorter
                "lg:h-87.5",
                tall ? "h-48 sm:h-56" : "h-32 sm:h-40",
            ].join(" ")}
        >
            <Image
                src={`/images/inspiration-in-frames/Card UI - ${index + 1}.png`}
                alt={`Inspiration frame ${index + 1}`}
                width={1000}
                height={1000}
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-all duration-300"
            />

            {/* Instagram icon — appears on hover */}
            <div className="w-12.5 h-12.5 bg-white absolute left-2.5 bottom-2.5 opacity-0 pointer-events-none group-hover:opacity-100 flex items-center justify-center z-20 transition-opacity duration-500">
                <Image src="/images/icons/instagram.png" alt="Instagram" width={1000} height={1000} className="w-10 h-10 object-contain" />
            </div>
        </li>
    );
}
