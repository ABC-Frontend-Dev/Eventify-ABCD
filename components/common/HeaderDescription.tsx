// components/common/HeaderDescription.tsx
import ScrollReveal from "@/components/Animations/ScrollReveal";
interface HeaderDescriptionProps {
    description: string;
    scrollContainerRef: any;
}

export default function HeaderDescription(params: HeaderDescriptionProps) {
    return (
        <p className="mt-1 sm:mt-2 text-sm lg:text-base font-helvetica leading-5 tracking-wider text-slate-800">
            <ScrollReveal scrollContainerRef={params.scrollContainerRef} baseOpacity={0.1} enableBlur baseRotation={3} blurStrength={4}>
                {params.description}
            </ScrollReveal>
        </p>
    );
}
