"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useToasts } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Crown, Shield, Loader2, Eye, EyeOff, Pencil, X, Check } from "lucide-react";
import DashboardHeader from "../common/Header";

interface Admin {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN";
    createdAt: string;
}

const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

// ─── Add Admin Form ───────────────────────────────────────────────────────────
function AddAdminForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const toast = useToasts();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim()) {
            toast.warning("All fields are required.");
            return;
        }
        if (form.password.length < 6) {
            toast.warning("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("/api/admins", form);
            if (res.data.success) {
                toast.success(res.data.message);
                onSuccess();
            } else {
                toast.error(res.data.error);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to create admin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-800">New Admin</p>
                <button type="button" onClick={onCancel} className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs text-slate-600 mb-1.5 block">
                        First Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                        value={form.firstName}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                firstName: e.target.value,
                            }))
                        }
                        placeholder="John"
                        className={inp}
                        disabled={loading}
                    />
                </div>
                <div>
                    <Label className="text-xs text-slate-600 mb-1.5 block">
                        Last Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                        value={form.lastName}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                lastName: e.target.value,
                            }))
                        }
                        placeholder="Doe"
                        className={inp}
                        disabled={loading}
                    />
                </div>
            </div>

            <div>
                <Label className="text-xs text-slate-600 mb-1.5 block">
                    Email <span className="text-red-400">*</span>
                </Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="john@eventify.com" className={inp} disabled={loading} />
            </div>

            <div>
                <Label className="text-xs text-slate-600 mb-1.5 block">
                    Temporary Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                password: e.target.value,
                            }))
                        }
                        placeholder="Min. 6 characters"
                        className={`${inp} pr-9`}
                        disabled={loading}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">This password will be sent to the admin via email.</p>
            </div>

            <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading} className="h-8 text-xs">
                    Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading} className="h-8 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
                    Create Admin & Send Email
                </Button>
            </div>
        </form>
    );
}

// ─── Profile + Password Section ───────────────────────────────────────────────
function MyProfileSection({ currentAdmin }: { currentAdmin: Admin }) {
    const toast = useToasts();
    const { update: updateSession } = useSession();

    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [profile, setProfile] = useState({
        firstName: currentAdmin.firstName,
        lastName: currentAdmin.lastName,
        email: currentAdmin.email,
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const res = await axios.put("/api/admins/profile", {
                type: "profile",
                ...profile,
            });
            if (res.data.success) {
                toast.success("Profile updated successfully.");
                // Update the session so the name in sidebar reflects change
                await updateSession({
                    name: `${profile.firstName} ${profile.lastName}`,
                    email: profile.email,
                });
            } else {
                toast.error(res.data.error);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to update profile.");
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (passwords.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }
        setPasswordLoading(true);
        try {
            const res = await axios.put("/api/admins/profile", {
                type: "password",
                ...passwords,
            });
            if (res.data.success) {
                toast.success("Password changed successfully.");
                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                toast.error(res.data.error);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to change password.");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Profile info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-4">My Profile</p>
                <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-slate-600 mb-1.5 block">First Name</Label>
                            <Input
                                value={profile.firstName}
                                onChange={(e) =>
                                    setProfile((p) => ({
                                        ...p,
                                        firstName: e.target.value,
                                    }))
                                }
                                className={inp}
                                disabled={profileLoading}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-600 mb-1.5 block">Last Name</Label>
                            <Input
                                value={profile.lastName}
                                onChange={(e) =>
                                    setProfile((p) => ({
                                        ...p,
                                        lastName: e.target.value,
                                    }))
                                }
                                className={inp}
                                disabled={profileLoading}
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-slate-600 mb-1.5 block">Email</Label>
                        <Input
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                                setProfile((p) => ({
                                    ...p,
                                    email: e.target.value,
                                }))
                            }
                            className={inp}
                            disabled={profileLoading}
                        />
                    </div>
                    <Button type="submit" size="sm" disabled={profileLoading} className="h-8 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                        {profileLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
                        Save Profile
                    </Button>
                </form>
            </div>

            {/* Change password */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Change Password</p>
                <form onSubmit={handlePasswordSave} className="space-y-4">
                    {/* Current password */}
                    <div>
                        <Label className="text-xs text-slate-600 mb-1.5 block">
                            Current Password <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                type={showCurrent ? "text" : "password"}
                                value={passwords.currentPassword}
                                onChange={(e) =>
                                    setPasswords((p) => ({
                                        ...p,
                                        currentPassword: e.target.value,
                                    }))
                                }
                                placeholder="••••••••"
                                className={`${inp} pr-9`}
                                disabled={passwordLoading}
                            />
                            <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    </div>

                    {/* New password */}
                    <div>
                        <Label className="text-xs text-slate-600 mb-1.5 block">
                            New Password <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                type={showNew ? "text" : "password"}
                                value={passwords.newPassword}
                                onChange={(e) =>
                                    setPasswords((p) => ({
                                        ...p,
                                        newPassword: e.target.value,
                                    }))
                                }
                                placeholder="Min. 6 characters"
                                className={`${inp} pr-9`}
                                disabled={passwordLoading}
                            />
                            <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm password */}
                    <div>
                        <Label className="text-xs text-slate-600 mb-1.5 block">
                            Confirm New Password <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                type={showConfirm ? "text" : "password"}
                                value={passwords.confirmPassword}
                                onChange={(e) =>
                                    setPasswords((p) => ({
                                        ...p,
                                        confirmPassword: e.target.value,
                                    }))
                                }
                                placeholder="Repeat new password"
                                className={`${inp} pr-9`}
                                disabled={passwordLoading}
                            />
                            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                        {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                            <p className="mt-1 text-[11px] text-red-500">Passwords do not match</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        size="sm"
                        disabled={passwordLoading || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                        className="h-8 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                    >
                        {passwordLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
                        Change Password
                    </Button>
                </form>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminsPage() {
    const { data: session } = useSession();
    const toast = useToasts();
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [handoverTarget, setHandoverTarget] = useState<Admin | null>(null);
    const [handoverLoading, setHandoverLoading] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

    const fetchAdmins = async () => {
        try {
            const res = await axios.get("/api/admins");
            if (res.data.success) {
                setAdmins(res.data.data);
                // Find current logged-in admin from list
                const me = res.data.data.find((a: Admin) => a.id === parseInt(session?.user?.id ?? "0"));
                if (me) setCurrentAdmin(me);
            }
        } catch {
            toast.error("Failed to load admins.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.id) fetchAdmins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.id]);

    const handleDelete = (admin: Admin) => {
        toast.message({
            text: `Delete admin "${admin.firstName} ${admin.lastName}"? This cannot be undone.`,
            preserve: true,
            action: "Delete",
            onAction: async () => {
                try {
                    const res = await axios.delete(`/api/admins/${admin.id}`);
                    if (res.data.success) {
                        toast.success("Admin deleted.");
                        fetchAdmins();
                    } else {
                        toast.error(res.data.error);
                    }
                } catch (err: any) {
                    toast.error(err?.response?.data?.error || "Failed to delete admin.");
                }
            },
        });
    };

    const handleHandoverConfirm = async () => {
        if (!handoverTarget) return;
        setHandoverLoading(true);
        try {
            const res = await axios.post("/api/admins/handover", {
                targetAdminId: handoverTarget.id,
            });
            if (res.data.success) {
                toast.success(res.data.message);
                setHandoverTarget(null);
                // Refresh page so session role updates
                setTimeout(() => window.location.reload(), 1200);
            } else {
                toast.error(res.data.error);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to hand over role.");
        } finally {
            setHandoverLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    const otherAdmins = admins.filter((a) => a.id !== parseInt(session?.user?.id ?? "0"));

    return (
        <div className="space-y-6">
            <DashboardHeader title="Admins" description={`${admins.length} admin${admins.length !== 1 ? "s" : ""} · ${isSuperAdmin ? "Super Admin" : "Admin"}`} />

            <div className="flex flex-col xl:flex-row gap-5">
                {/* ── Left: admin list ── */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* Add admin button — super admin only */}
                    {isSuperAdmin && !showAddForm && (
                        <Button size="sm" onClick={() => setShowAddForm(true)} className="h-8 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Add New Admin
                        </Button>
                    )}

                    {/* Add admin form */}
                    {isSuperAdmin && showAddForm && (
                        <AddAdminForm
                            onSuccess={() => {
                                setShowAddForm(false);
                                fetchAdmins();
                            }}
                            onCancel={() => setShowAddForm(false)}
                        />
                    )}

                    {/* Admin list */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <p className="text-sm font-semibold text-slate-800">All Admins</p>
                        </div>

                        <ul className="divide-y divide-slate-50">
                            {admins.map((admin) => {
                                const isMe = admin.id === parseInt(session?.user?.id ?? "0");
                                const isSA = admin.role === "SUPER_ADMIN";

                                return (
                                    <li key={admin.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${isSA ? "bg-purple-600" : "bg-slate-700"}`}>
                                                {admin.firstName[0]}
                                                {admin.lastName[0]}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {admin.firstName} {admin.lastName}
                                                        {isMe && <span className="ml-1.5 text-[10px] font-normal text-slate-400">(you)</span>}
                                                    </p>
                                                    {/* Role badge */}
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                            isSA ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {isSA ? <Crown className="h-2.5 w-2.5" /> : <Shield className="h-2.5 w-2.5" />}
                                                        {isSA ? "Super Admin" : "Admin"}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{admin.email}</p>
                                            </div>
                                        </div>

                                        {/* Actions — super admin only, not on self */}
                                        {isSuperAdmin && !isMe && (
                                            <div className="flex items-center gap-2 shrink-0">
                                                {/* Handover button */}
                                                {!isSA && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setHandoverTarget(admin)}
                                                        className="h-7 text-[11px] gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                                                    >
                                                        <Crown className="h-3 w-3" />
                                                        Handover
                                                    </Button>
                                                )}

                                                {/* Delete button */}
                                                {!isSA && (
                                                    <button onClick={() => handleDelete(admin)} className="p-1.5 rounded-md text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* ── Right: my profile ── */}
                <div className="w-full xl:w-80 shrink-0">{currentAdmin && <MyProfileSection currentAdmin={currentAdmin} />}</div>
            </div>

            {/* ── Handover confirmation dialog ── */}
            {handoverTarget && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center mb-5">
                            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-purple-100 mb-4">
                                <Crown className="h-7 w-7 text-purple-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Hand Over Super Admin?</h2>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                You are about to transfer the Super Admin role to{" "}
                                <strong className="text-slate-800">
                                    {handoverTarget.firstName} {handoverTarget.lastName}
                                </strong>
                                . You will become a regular Admin. This action can be reversed by the new Super Admin.
                            </p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
                            <p className="text-xs text-amber-700 leading-relaxed">⚠️ The new Super Admin will receive an email notification. You will lose your Super Admin privileges immediately.</p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setHandoverTarget(null)} disabled={handoverLoading}>
                                Cancel
                            </Button>
                            <Button className="flex-1 h-9 text-sm bg-purple-600 hover:bg-purple-700 text-white" onClick={handleHandoverConfirm} disabled={handoverLoading}>
                                {handoverLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Crown className="h-4 w-4 mr-1.5" />}
                                Yes, Hand Over
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
