"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/ui/navbar";
export default function NavbarMenu() {
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    const menus = [
        { id: 1, title: "Home", name: "Home", url: "/", dropdown: false },
        { id: 2, title: "About Us", name: "About Us", url: "/about", dropdown: false },
        { id: 3, title: "Projects", name: "Projects", url: "/projects", dropdown: false },
        { id: 4, title: "Clients", name: "Clients", url: "/clients", dropdown: false },
        { id: 5, title: "Services", name: "Services", url: "/services", dropdown: false },
        { id: 6, title: "Teams", name: "Teams", url: "/teams", dropdown: false },
        { id: 7, title: "Awards", name: "Awards", url: "/awards", dropdown: false },
        { id: 8, title: "Blogs", name: "Blogs", url: "/blog", dropdown: false },
    ];
    return <NavBar list={menus} currentPath={pathname} isScrolled={isScrolled} />;
}
