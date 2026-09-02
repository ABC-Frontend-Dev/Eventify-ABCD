// components/layout/Awards/AwardsYearTabContent.tsx
"use client";

import AwardsKenBurnsCarousel from "./AwardsKenBurnsCarousel";

interface AwardImage {
    id: number;
    url: string;
    imageAlt: string;
    title: string;
    description: string;
}

interface AwardCategory {
    id: number;
    name: string;
    icon: string;
    iconAlt: string;
    images: AwardImage[];
}

interface AwardsYearTabContentProps {
    categories: AwardCategory[];
}

export default function AwardsYearTabContent({ categories }: AwardsYearTabContentProps) {
    // Flatten every category's images into one ordered list, tagging each
    // image with its parent category's icon so the carousel can show the
    // right badge for whichever image is currently active.
    const allImages = categories.flatMap((category) =>
        category.images.map((image) => ({
            ...image,
            categoryIcon: category.icon,
            categoryIconAlt: category.iconAlt,
        })),
    );

    return (
        <div className="relative w-full h-64 sm:h-96 lg:h-175">
            <AwardsKenBurnsCarousel images={allImages} autoplayDelay={2500} />
        </div>
    );
}