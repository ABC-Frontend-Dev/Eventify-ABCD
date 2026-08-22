// app/(frontend)/page.tsx
import type { Metadata } from "next";
import NewsletterPage from "@/components/dashboard/layout/newsletter/NewsletterPage";
import AboutUs from "@/components/layout/AboutUs/AboutUs";
import Awards from "@/components/layout/Awards/Awards";
import BeforeAndAfterComparision from "@/components/layout/Services/3d-event-design-fabrication-build/BeforeAndAfterComparision";
import ContactModal from "@/components/layout/Contact/ContactModal";
import HeroPageLoader from "@/components/layout/HeroPageLoader/HeroPageLoader";
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import HomeBlogs from "@/components/layout/HomeBlogs/HomeBlogs";
import InspirationInFrames from "@/components/layout/InspirationInFrames/InspirationInFrames";
import OurClients from "@/components/layout/OurClients/OurClients";
import OurServices from "@/components/layout/OurServices/OurServices";
import OurTeam from "@/components/layout/OurTeam/OurTeam";
import Projects from "@/components/layout/Projects/Projects";

export const metadata: Metadata = {
    title: "Event Management Company in Dubai & Riyadh | Eventify Entertainment",
    description:
        "Eventify Entertainment is a leading event management and production company in Dubai and Riyadh, specializing in corporate event management, experiential marketing, brand activation, conference management, and exhibition management across the UAE.",
    keywords: [
        "event management company Dubai",
        "event production company Dubai",
        "corporate event management Dubai",
        "event management Riyadh",
        "event production Riyadh",
        "experiential marketing Dubai",
        "brand activation Dubai",
        "event production UAE",
        "corporate events UAE",
        "experiential events Dubai",
        "conference management Dubai",
        "exhibition management Dubai",
        "event agency Riyadh",
    ],
    openGraph: {
        title: "Event Management Company in Dubai & Riyadh | Eventify Entertainment",
        description: "Leading event management and production company in Dubai and Riyadh — corporate events, experiential marketing, brand activation, conferences, and exhibitions across the UAE.",
        url: "/",
        siteName: "Eventify Entertainment",
        images: [
            {
                url: "https://res.cloudinary.com/afdhm38k/image/upload/v1787306416/Evevntify_OG_Image_tvlxn2.png",
                width: 1200,
                height: 630,
                alt: "Eventify Entertainment — Event Management Company in Dubai & Riyadh",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Event Management Company in Dubai & Riyadh | Eventify Entertainment",
        description: "Leading event management and production company in Dubai and Riyadh — corporate events, experiential marketing, brand activation, conferences, and exhibitions across the UAE.",
        images: ["https://res.cloudinary.com/afdhm38k/image/upload/v1787306416/Evevntify_OG_Image_tvlxn2.png"],
    },
};

export default function Home() {
    return (
        <>
            {/* <ContactModal /> */}
            {/* <HeroPageLoader /> */}
            <HeroSection />
            <AboutUs />
            <OurClients />
            <OurServices />
            {/* <BeforeAndAfterComparision /> */}
            <OurTeam />
            <Projects />
            <Awards />
            <HomeBlogs />
            <InspirationInFrames />
        </>
    );
}
