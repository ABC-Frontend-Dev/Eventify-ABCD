// app/(dashboard)/dashboard/layout.tsx
"use client";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSidebar } from "@/components/dashboard/layout/DashboardSidebar";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    clients: "Clients",
    projects: "Projects",
    blogs: "Blogs",
    contacts: "Contacts",
    settings: "Settings",
    new: "New",
    edit: "Edit",
    authors: "Authors",
    "blog-categories": "Blog Categories",
    "project-categories": "Project Categories",
};

function Breadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    return (
        <nav className="flex items-center gap-1">
            {segments.map((seg, i) => {
                const isLast = i === segments.length - 1;
                const label = LABELS[seg] ?? seg.replace(/-/g, " ");
                return (
                    <span key={seg} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
                        <span className={isLast ? "text-xs font-semibold text-slate-800" : "text-xs text-slate-400"}>{label}</span>
                    </span>
                );
            })}
        </nav>
    );
}

// ── Auth-only pages that should NOT get the sidebar ───────
const AUTH_PATHS = ["/dashboard/login", "/dashboard/register"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/login"); // ← was "/dashboard/login"
    };
    // ── If on login/register — render plain, no sidebar ──
    const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

    if (isAuthPage) {
        return <>{children}</>;
    }

    // ── Normal dashboard layout with sidebar ──────────────
    return (
        <TooltipProvider>
            <SidebarProvider defaultOpen={true}>
                <DashboardSidebar />

                <SidebarInset>
                    {/* header */}
                    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
                        <SidebarTrigger className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" />

                        <div className="h-4 w-px bg-slate-200" />

                        <Breadcrumb />

                        <div className="flex-1" />

                        {session && (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                                        {session.user?.name?.charAt(0).toUpperCase() ?? "A"}
                                    </div>
                                    <span className="text-xs font-medium text-slate-700">{session.user?.name}</span>
                                </div>

                                <div className="h-4 w-px bg-slate-200" />

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    aria-label="Sign out"
                                    className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        )}
                    </header>

                    {/* page content */}
                    <div className="flex flex-1 flex-col gap-4 p-5 bg-slate-50/60">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}
