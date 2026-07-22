"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Home, Users, FolderKanban, Newspaper, Settings, Plus, ChevronRight, List, Mail, LogOut, Trophy, BriefcaseBusiness, Layers, type LucideIcon, User2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { signOut } from "next-auth/react";

type SubMenuItem = {
    title: string;
    icon: LucideIcon;
    href: string;
};

type MenuItem = {
    title: string;
    icon: LucideIcon;
    href: string;
    live?: boolean;
    subItems?: SubMenuItem[];
};

const menuItems: MenuItem[] = [
    {
        title: "Dashboard",
        icon: Home,
        href: "/dashboard",
        live: true,
    },
    {
        title: "Clients",
        icon: Users,
        href: "/dashboard/clients",
        subItems: [
            { title: "All Clients", icon: List, href: "/dashboard/clients" },
            { title: "Add New Client", icon: Plus, href: "/dashboard/clients/new" },
        ],
    },
    {
        title: "Team",
        icon: Users,
        href: "/dashboard/team",
        subItems: [
            { title: "All Team Members", icon: List, href: "/dashboard/team" },
            { title: "Add Team Member", icon: Plus, href: "/dashboard/team/new" },
        ],
    },
    {
        title: "Projects",
        icon: FolderKanban,
        href: "/dashboard/projects",
        subItems: [
            { title: "All Projects", icon: List, href: "/dashboard/projects" },
            { title: "Add New Project", icon: Plus, href: "/dashboard/projects/new" },
            { title: "Project Categories", icon: List, href: "/dashboard/project-categories" },
        ],
    },
    {
        title: "Services",
        icon: BriefcaseBusiness,
        href: "/dashboard/services",
        subItems: [
            { title: "All Services", icon: List, href: "/dashboard/services" },
            { title: "Add New Service", icon: Plus, href: "/dashboard/services/new" },
        ],
    },
    {
        title: "Awards",
        icon: Trophy,
        href: "/dashboard/awards",
        subItems: [
            { title: "All Awards", icon: List, href: "/dashboard/awards" },
            { title: "Add New Award", icon: Plus, href: "/dashboard/awards/new" },
        ],
    },
    {
        title: "Blogs",
        icon: Newspaper,
        href: "/dashboard/blogs",
        subItems: [
            { title: "All Blogs", icon: List, href: "/dashboard/blogs" },
            { title: "Add New Blog", icon: Plus, href: "/dashboard/blogs/new" },
            { title: "Blog Categories", icon: List, href: "/dashboard/blog-categories" },
            { title: "Authors", icon: List, href: "/dashboard/authors" },
        ],
    },
    {
        title: "Comparisons",
        icon: Layers,
        href: "/dashboard/comparisons",
        subItems: [
            { title: "All Comparisons", icon: List, href: "/dashboard/comparisons" },
            { title: "Add New Comparison", icon: Plus, href: "/dashboard/comparisons/new" },
        ],
    },
    {
        title: "Contacts",
        icon: Mail,
        href: "/dashboard/contacts",
    },
    {
        title: "Profile",
        icon: User2,
        href: "/dashboard/profile",
    },
    // {
    //     title: "Settings",
    //     icon: Settings,
    //     href: "/dashboard/settings",
    // },
];

export function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar className="border-r border-slate-200/80 bg-white">
            {/* ── Logo ──────────────────────────────────── */}
            <SidebarHeader className="border-b border-slate-100 px-4 py-3.5">
                <Link href="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">E</div>
                    <div>
                        <p className="text-sm font-semibold leading-none text-slate-900 tracking-tight">Eventify</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Admin console</p>
                    </div>
                </Link>
            </SidebarHeader>

            {/* ── Nav ───────────────────────────────────── */}
            <SidebarContent className="px-2 py-3">
                <SidebarGroup className="p-0">
                    <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Menu</p>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-0.5">
                            {menuItems.map((item) => {
                                const isActive = item.subItems ? pathname.startsWith(item.href) : item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

                                if (item.subItems) {
                                    return (
                                        <Collapsible key={item.title} defaultOpen={isActive} className="group/collapsible">
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton
                                                        isActive={isActive}
                                                        tooltip={item.title}
                                                        className={`
                                                            h-8 rounded-md text-xs font-medium transition-colors
                                                            text-slate-600 hover:bg-slate-100 hover:text-slate-900
                                                            data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900 data-[active=true]:font-semibold
                                                        `}
                                                    >
                                                        <item.icon className="h-[15px] w-[15px] shrink-0" />
                                                        <span>{item.title}</span>
                                                        <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <SidebarMenuSub className="ml-2 mt-0.5 space-y-0.5 border-l border-slate-100 pl-3">
                                                        {item.subItems.map((sub) => {
                                                            const isSubActive = pathname === sub.href || (sub.href !== item.href && pathname.startsWith(sub.href));

                                                            return (
                                                                <SidebarMenuSubItem key={sub.title}>
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        isActive={isSubActive}
                                                                        className={`
                                                                            h-7 rounded-md text-[11px] font-medium transition-colors
                                                                            text-slate-500 hover:bg-slate-100 hover:text-slate-900
                                                                            data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900 data-[active=true]:font-semibold
                                                                        `}
                                                                    >
                                                                        <Link href={sub.href}>
                                                                            <sub.icon className="h-3 w-3 shrink-0" />
                                                                            <span>{sub.title}</span>
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            );
                                                        })}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    );
                                }

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={`
                                                h-8 rounded-md text-xs font-medium transition-colors
                                                text-slate-600 hover:bg-slate-100 hover:text-slate-900
                                                data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900 data-[active=true]:font-semibold
                                            `}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="h-[15px] w-[15px] shrink-0" />
                                                <span>{item.title}</span>

                                                {item.live && (
                                                    <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-emerald-500">
                                                        <span className="h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                                                    </span>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Footer / user ─────────────────────────── */}
            <SidebarFooter className="border-t border-slate-100 p-3">
                <div className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-slate-50 transition-colors">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">A</div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800">Admin User</p>
                        <p className="truncate text-[10px] text-slate-400">admin@eventify.com</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        aria-label="Sign out"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-500"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
