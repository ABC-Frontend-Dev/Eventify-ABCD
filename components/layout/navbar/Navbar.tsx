"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Variant from "@/components/ui/animated-menu";
import NavbarMenu from "./NavbarMenus";
import MobileSidebar from "./MobileSidebar";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

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

    // Configure your logos here
    const logo = {
        default: "/images/logo-light.png", // Logo when not scrolled
        scrolled: "/images/logo.png", // Logo when scrolled (optional - remove if using same logo)
    };

    return (
        <header
            className={`fixed top-0 left-0 w-full h-20 lg:h-fit flex items-center justify-between px-4 sm:px-6 lg:px-20 py-4 lg:py-7.5 z-[100] transition-all duration-300 ${
                isScrolled
                    ? "bg-white/50 backdrop-blur-md" // Scrolled state
                    : "bg-transparent" // Top state
            }`}
        >
            <div className="flex-shrink-0 max-w-[150px] sm:max-w-[180px]">
                <Image
                    src={isScrolled ? logo.scrolled || logo.default : logo.default}
                    alt="Logo"
                    width={156}
                    height={34}
                    className="w-full h-auto object-contain transition-all duration-300"
                    priority
                />
            </div>
            <nav className="flex-shrink-0">
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
