import ScrollReveal from "@/components/Animations/ScrollReveal";

interface HeaderDescriptionProps {
    description?: string | null;
    scrollContainerRef: any;
}

export default function HeaderDescription({ description, scrollContainerRef }: HeaderDescriptionProps) {
    if (!description || !description.trim()) return null;

    return (
        <p className="mt-1 sm:mt-2 text-sm lg:text-base font-helvetica leading-5 tracking-wider text-slate-800">
            <ScrollReveal scrollContainerRef={scrollContainerRef} baseOpacity={0.1} enableBlur baseRotation={3} blurStrength={4}>
                {description}
            </ScrollReveal>
        </p>
    );
}
