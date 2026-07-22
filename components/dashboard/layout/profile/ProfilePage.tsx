// components/dashboard/layout/profile/ProfilePage.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardHeader from "../common/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import PasswordChangeModal from "./PasswordChangeModal";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && status === "unauthenticated") {
            router.push("/dashboard/login");
        }
    }, [status, mounted, router]);

    if (!mounted || status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Failed to load profile. Please try logging in again.</p>
            </div>
        );
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "N/A";
        }
    };

    return (
        <div className="space-y-6">
            <DashboardHeader title="My Profile" description="Manage your account settings" />

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your account details (read-only)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600">Name</label>
                            <p className="text-base mt-1">{session.user.name || "N/A"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600">Email</label>
                            <p className="text-base mt-1">{session.user.email || "N/A"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setShowPasswordModal(true)} variant="outline">
                        Change Password
                    </Button>
                </CardContent>
            </Card>

            <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} userEmail={session.user.email || ""} />
        </div>
    );
}
