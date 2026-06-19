"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/ui/navbar";

type NavbarMenuProps = {
    isScrolled: boolean;
    activeSection: string | null;
};

export default function NavbarMenu({ isScrolled, activeSection }: NavbarMenuProps) {
    const pathname = usePathname();

    const menus = [
        { id: 1, title: "Home", name: "Home", url: "/", dropdown: false },
        { id: 2, title: "About Us", name: "About Us", url: "#about-us", sectionId: "about-us", dropdown: false },
        { id: 3, title: "Projects", name: "Projects", url: "#", dropdown: false },
        { id: 4, title: "Clients", name: "Clients", url: "#our-clients", sectionId: "our-clients", dropdown: false },
        { id: 5, title: "Services", name: "Services", url: "#our-services", sectionId: "our-services", dropdown: false },
        { id: 6, title: "Teams", name: "Teams", url: "#teams", sectionId: "teams", dropdown: false },
        { id: 7, title: "Awards", name: "Awards", url: "#awards", sectionId: "awards", dropdown: false },
        { id: 8, title: "Blogs", name: "Blogs", url: "/blog", dropdown: false },
    ];

    return <NavBar list={menus} currentPath={pathname} isScrolled={isScrolled} activeSection={activeSection} />;
}
