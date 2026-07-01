// app/(frontend)/page.tsx
import AboutUs from "@/components/layout/AboutUs/AboutUs";
import Awards from "@/components/layout/Awards/Awards";
import ContactModal from "@/components/layout/Contact/ContactModal";
import HeroPageLoader from "@/components/layout/HeroPageLoader/HeroPageLoader";
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import HomeBlogs from "@/components/layout/HomeBlogs/HomeBlogs";
import InspirationInFrames from "@/components/layout/InspirationInFrames/InspirationInFrames";
import OurClients from "@/components/layout/OurClients/OurClients";
import OurServices from "@/components/layout/OurServices/OurServices";
import OurTeam from "@/components/layout/OurTeam/OurTeam";
import Projects from "@/components/layout/Projects/Projects";

export default function Home() {
    return (
        <>
            {/* <ContactModal /> */}
            <HeroPageLoader />
            <HeroSection />
            <AboutUs />
            <OurClients />
            <OurServices />
            <OurTeam />
            <Awards />
            <Projects />
            <HomeBlogs />
            <InspirationInFrames />
        </>
    );
}
