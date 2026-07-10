// lib/data/awards-data.ts

export type AwardItem = {
    id: number;
    title: string;
    description: string;
};

export type AwardCategory = {
    id: string;
    icon: string;
    iconAlt: string;
    items: AwardItem[];
    carouselImages: string[];
    gradientWidthClass: string;
};

export type YearAwards = {
    year: number;
    categories: AwardCategory[];
};

// 🏆 2025 Awards Data
const awards2025: YearAwards = {
    year: 2025,
    categories: [
        {
            id: "wow-awards-middle-east-2025",
            icon: "/images/awards/icons/wow-awards-middle-east.png",
            iconAlt: "WOW Awards Middle East 2025",
            items: [
                {
                    id: 1,
                    title: "Exeed Exlantix Launch",
                    description: "Special Event Of The Year For Government / Federation / Association",
                },
                {
                    id: 2,
                    title: "Arab Media Summit",
                    description: "Government Convention/ Business Event Of The Year",
                },
                {
                    id: 3,
                    title: "Hatta Winter Festival",
                    description: "Special Event Of The Year For Government / Federation / Association",
                },
                {
                    id: 4,
                    title: "Sole DXB",
                    description: "Public Special Event Of The Year",
                },
            ],
            carouselImages: [
                "/images/awards/2025/wow-award/WOW_Awards_347.webp",
                "/images/awards/2025/wow-award/WOW_Awards_429.webp",
                "/images/awards/2025/wow-award/WOW_Awards_414.webp",
                "/images/awards/2025/wow-award/WOW_Awards_395.webp",
                "/images/awards/2025/wow-award/WOW_Awards_392.webp",
                "/images/awards/2025/wow-award/WOW_Awards_351.webp",
            ],
            gradientWidthClass: "w-4/5",
        },
        // {
        //     id: "middle-east-event-awards-2025",
        //     icon: "/images/awards/icons/middle-east-event-awards.png",
        //     iconAlt: "Middle East Event Awards 2025",
        //     items: [
        //         {
        //             id: 1,
        //             title: "Arab Media Summit",
        //             description: "Government Convention/ Business Event Of The Year",
        //         },
        //         {
        //             id: 2,
        //             title: "Hatta Winter Festival",
        //             description: "Special Event Of The Year For Government / Federation / Association",
        //         },
        //     ],
        //     carouselImages: ["/images/awards/2025/middle-east-1.png", "/images/awards/2025/middle-east-2.png", "/images/awards/2025/middle-east-3.png", "/images/awards/2025/middle-east-4.png"],
        //     gradientWidthClass: "w-full",
        // },
    ],
};

// 🏆 2024 Awards Data
const awards2024: YearAwards = {
    year: 2024,
    categories: [
        {
            id: "wow-awards-middle-east-2024",
            icon: "/images/awards/icons/wow-awards-middle-east.png",
            iconAlt: "WOW Awards Middle East 2024",
            items: [
                {
                    id: 1,
                    title: "Dubai Shopping Festival",
                    description: "Retail Event Of The Year 2024",
                },
                {
                    id: 2,
                    title: "Tech Summit Dubai",
                    description: "Technology Conference Of The Year",
                },
                {
                    id: 3,
                    title: "Fashion Week Middle East",
                    description: "Fashion Event Of The Year",
                },
            ],
            carouselImages: ["/images/awards/2024/wow-award/award-1.webp", "/images/awards/2024/wow-award/award-2.webp", "/images/awards/2024/wow-award/award-3.webp"],
            gradientWidthClass: "w-4/5",
        },
        // {
        //     id: "middle-east-event-awards-2024",
        //     icon: "/images/awards/icons/middle-east-event-awards.png",
        //     iconAlt: "Middle East Event Awards 2024",
        //     items: [
        //         {
        //             id: 1,
        //             title: "Corporate Gala 2024",
        //             description: "Best Corporate Event",
        //         },
        //     ],
        //     carouselImages: ["/images/awards/2024/middle-east-1.png", "/images/awards/2024/middle-east-2.png"],
        //     gradientWidthClass: "w-full",
        // },
    ],
};

// 🏆 2023 Awards Data
const awards2023: YearAwards = {
    year: 2023,
    categories: [
        {
            id: "wow-awards-middle-east-2023",
            icon: "/images/awards/icons/wow-awards-middle-east.png",
            iconAlt: "WOW Awards Middle East 2023",
            items: [
                {
                    id: 1,
                    title: "Expo City Concert Series",
                    description: "Entertainment Event Of The Year 2023",
                },
                {
                    id: 2,
                    title: "Smart City Summit",
                    description: "Innovation Conference Of The Year",
                },
            ],
            carouselImages: ["/images/awards/2023/wow-award/award-1.webp"],
            gradientWidthClass: "w-4/5",
        },
        // {
        //     id: "middle-east-event-awards-2023",
        //     icon: "/images/awards/icons/middle-east-event-awards.png",
        //     iconAlt: "Middle East Event Awards 2023",
        //     items: [
        //         {
        //             id: 1,
        //             title: "Healthcare Excellence Forum",
        //             description: "Healthcare Event Of The Year",
        //         },
        //     ],
        //     carouselImages: ["/images/awards/2023/middle-east-1.png"],
        //     gradientWidthClass: "w-full",
        // },
    ],
};

// 🏆 2022 Awards Data
const awards2022: YearAwards = {
    year: 2022,
    categories: [
        {
            id: "wow-awards-middle-east-2022",
            icon: "/images/awards/icons/wow-awards-middle-east.png",
            iconAlt: "WOW Awards Middle East 2022",
            items: [
                {
                    id: 1,
                    title: "Dubai World Cup",
                    description: "Sports Event Of The Year 2022",
                },
            ],
            carouselImages: ["/images/awards/2022/wow-awards-1.png"],
            gradientWidthClass: "w-4/5",
        },
        {
            id: "middle-east-event-awards-2022",
            icon: "/images/awards/icons/middle-east-event-awards.png",
            iconAlt: "Middle East Event Awards 2022",
            items: [
                {
                    id: 1,
                    title: "Cultural Festival 2022",
                    description: "Cultural Event Of The Year",
                },
            ],
            carouselImages: ["/images/awards/2022/middle-east-1.png"],
            gradientWidthClass: "w-full",
        },
    ],
};

// Export all years data
export const AWARDS_DATA: Record<number, YearAwards> = {
    2025: awards2025,
    2024: awards2024,
    2023: awards2023,
    2022: awards2022,
};

// Helper function to get awards by year
export function getAwardsByYear(year: number): YearAwards | undefined {
    return AWARDS_DATA[year];
}

// Get all available years
export function getAvailableYears(): number[] {
    return Object.keys(AWARDS_DATA)
        .map(Number)
        .sort((a, b) => b - a); // Sort descending (newest first)
}
