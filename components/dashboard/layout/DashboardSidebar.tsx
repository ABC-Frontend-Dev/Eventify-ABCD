"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarMenuAction,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { Home, Users, FolderKanban, Newspaper, Settings, Plus, ChevronRight, List, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function DashboardSidebar() {
    const pathname = usePathname();

    const menuItems = [
        {
            title: "Dashboard",
            icon: Home,
            href: "/dashboard",
        },
        {
            title: "Clients",
            icon: Users,
            href: "",
            subItems: [
                {
                    title: "All Clients",
                    icon: List,
                    href: "/dashboard/clients",
                },
                {
                    title: "Add New Client",
                    icon: Plus,
                    href: "/dashboard/clients/new",
                },
            ],
        },
        {
            title: "Projects",
            icon: FolderKanban,
            href: "/dashboard/projects",
            subItems: [
                {
                    title: "All Projects",
                    icon: List,
                    href: "/dashboard/projects",
                },
                {
                    title: "Add New Project",
                    icon: Plus,
                    href: "/dashboard/projects/new",
                },
                {
                    title: "Project Categories",
                    icon: Plus,
                    href: "/dashboard/project-categories",
                },
            ],
        },
        {
            title: "Blogs",
            icon: Newspaper,
            href: "/dashboard/blogs",
            subItems: [
                {
                    title: "All Blogs",
                    icon: List,
                    href: "/dashboard/blogs",
                },
                {
                    title: "Add New Blog",
                    icon: Plus,
                    href: "/dashboard/blogs/new",
                },
                {
                    title: "Blog Categories",
                    icon: Plus,
                    href: "/dashboard/blog-categories",
                },
                {
                    title: "Authors",
                    icon: Plus,
                    href: "/dashboard/authors",
                },
            ],
        },
        {
            title: "Settings",
            icon: Settings,
            href: "/dashboard/settings",
        },
        {
            title: "Contacts",
            icon: Mail,
            href: "/dashboard/contacts",
        },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="border-b p-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image src={"/images/logo.png"} alt="about us" loading="eager" width={1000} height={1000} className="w-full h-12.5 object-contain" />
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                                // If item has subItems, render collapsible menu
                                if (item.subItems) {
                                    return (
                                        <Collapsible key={item.title} defaultOpen={isActive} className="group/collapsible">
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                                                        <item.icon />
                                                        <span>{item.title}</span>
                                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.subItems.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                                                    <Link href={subItem.href}>
                                                                        <subItem.icon className="h-4 w-4" />
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    );
                                }

                                // Regular menu item without subItems
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                                            <Link href={item.href}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t p-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                        <span className="text-xs font-medium text-primary-foreground">A</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Admin User</span>
                        <span className="text-xs text-muted-foreground">admin@eventify.com</span>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
