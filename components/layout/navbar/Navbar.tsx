"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NavbarMenu from "./NavbarMenus";
import MobileSidebar from "./MobileSidebar";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const defaultLogos = {
        default: "/images/logo-light.png", // Logo when not scrolled
        scrolled: "/images/logo.png", // Logo when scrolled
    };

    const getLogosForPage = () => {
        // Example: for blog pages
        if (pathname.startsWith("/blog")) {
            return {
                default: "/images/logo.png", // Light logo for blog when not scrolled
                scrolled: "/images/logo.png", // Dark logo for blog when scrolled
            };
        }

        // You can add more pages here
        // if (pathname.startsWith("/about")) {
        //     return {
        //         default: "/images/logo-dark.png",
        //         scrolled: "/images/logo-light.png",
        //     };
        // }

        return defaultLogos;
    };

    const logo = getLogosForPage();

    return (
        <header
            className={`fixed top-0 left-0 w-full h-20 lg:h-fit flex items-center justify-between px-4 sm:px-6 lg:px-20 py-4 lg:py-5 z-[100] transition-all duration-300 ${
                isScrolled
                    ? "bg-white/50 backdrop-blur-xs" // Scrolled state
                    : "bg-transparent" // Top state
            }`}
        >
            <div className="shrink-0 max-w-[150px] sm:max-w-[180px]">
                <Image
                    src={isScrolled ? logo.scrolled || logo.default : logo.default}
                    alt="Logo"
                    width={156}
                    height={34}
                    className="w-full h-auto object-contain transition-all duration-300"
                    priority
                />
            </div>
            <nav className="shrink-0">
                <div className="hidden lg:block">
                    <NavbarMenu isScrolled={isScrolled} />
                </div>
                <div className="lg:hidden">
                    <MobileSidebar />
                </div>
            </nav>
        </header>
    );
}
