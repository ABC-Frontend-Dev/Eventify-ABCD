// app/(dashboard)/dashboard/layout.tsx
"use client";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSidebar } from "@/components/dashboard/layout/DashboardSidebar";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/dashboard/login");
    };

    return (
        <TooltipProvider>
            <SidebarProvider defaultOpen={true}>
                <DashboardSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold">Dashboard</h1>
                        </div>
                        {session && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-gray-600" />
                                    <span className="text-sm font-medium">{session.user?.name}</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        )}
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}
