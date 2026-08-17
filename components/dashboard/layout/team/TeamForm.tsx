// components/dashboard/layout/team/TeamForm.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToasts } from "@/components/ui/toast";
import { ArrowLeft, Eye, Loader2, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ImageUploader } from "@/components/ui/image-uploader";
import axios from "axios";

interface TeamMember {
    id: number;
    name: string;
    role: string;
    image: string;
}

interface TeamFormProps {
    initialData?: TeamMember;
    memberId?: number;
    mode: "create" | "edit";
}

function FieldLabel({ children, required, ok }: { children: React.ReactNode; required?: boolean; ok?: boolean }) {
    return (
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
            {children}
            {required && <span className="text-red-400">*</span>}
            {ok && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />}
        </label>
    );
}

function SectionHeading({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );
}

export default function TeamForm({ initialData, memberId, mode }: TeamFormProps) {
    const router = useRouter();
    const toast = useToasts();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        role: initialData?.role || "",
        image: initialData?.image || "",
    });

    const completion = useMemo(
        () => [
            { label: "Member Name", ok: !!formData.name.trim() },
            { label: "Role", ok: !!formData.role.trim() },
            { label: "Photo", ok: !!formData.image },
        ],
        [formData],
    );

    const completionPct = Math.round((completion.filter((c) => c.ok).length / completion.length) * 100);
    const isFormValid = completion.every((c) => c.ok);

    useEffect(() => {
        if (mode === "edit" && memberId) {
            const loadMember = async () => {
                try {
                    const response = await axios.get(`/api/team/${memberId}`);
                    if (response.data.success && response.data.data) {
                        setFormData({
                            name: response.data.data.name,
                            role: response.data.data.role,
                            image: response.data.data.image,
                        });
                    }
                } catch (error) {
                    console.error("Error loading member:", error);
                    toast.error("Failed to load team member data");
                }
            };
            loadMember();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, memberId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleFileUpload = async (uploadedFiles: File[]) => {
        if (!uploadedFiles.length) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", uploadedFiles[0]);
            const res = await fetch("/api/upload", {
                method: "POST",
                body: fd,
            });
            const result = await res.json();
            if (result.success) {
                setFormData((p) => ({ ...p, image: result.path }));
                toast.success("Photo uploaded");
            } else {
                toast.error(result.error || "Failed to upload photo");
            }
        } catch {
            toast.error("Failed to upload photo");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!formData.name.trim()) {
            toast.warning("Please enter a member name");
            return;
        }
        if (!formData.role.trim()) {
            toast.warning("Please enter a role");
            return;
        }
        if (!formData.image.trim()) {
            toast.warning("Please upload a photo");
            return;
        }

        setLoading(true);
        try {
            const url = mode === "create" ? "/api/team" : `/api/team/${memberId}`;
            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (result.success) {
                toast.success(mode === "create" ? "Team member created! You can now arrange their position in the grid from the Team page." : "Team member updated!");
                setTimeout(() => {
                    router.push("/dashboard/team");
                    router.refresh();
                }, 800);
            } else {
                toast.error(result.message || result.error || "Failed to save team member");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

    return (
        <div className="min-h-screen bg-slate-50/60">
            {/* Sticky topbar */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="h-7 w-7 text-slate-500 hover:text-slate-900">
                        <Link href="/dashboard/team">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>

                    <div className="h-4 w-px bg-slate-200" />

                    <span className="text-xs text-slate-400">Team</span>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{mode === "create" ? "New member" : formData.name || "Edit member"}</span>

                    {/* Progress pill */}
                    <div className="hidden md:flex items-center gap-2 ml-3">
                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${completionPct}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-400">{completionPct}%</span>
                    </div>

                    <div className="flex-1" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        disabled={loading || uploading}
                        className="h-7 text-xs text-slate-500 hover:text-slate-900 hidden sm:inline-flex"
                    >
                        Cancel
                    </Button>

                    <Button type="button" size="sm" onClick={() => handleSubmit()} disabled={loading || uploading || !isFormValid} className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                        {mode === "create" ? "Create" : "Update"}
                    </Button>
                </div>
            </div>

            {/* Body */}
            <form id="team-form" onSubmit={handleSubmit} className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col xl:flex-row gap-5">
                {/* Main column */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* MEMBER INFO */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Member Info" />
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <FieldLabel required ok={!!formData.name}>
                                    Full Name
                                </FieldLabel>
                                <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. TEJAL MEHTA" className={inp} maxLength={100} />
                                <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.name.length}/100</p>
                            </div>

                            {/* Role */}
                            <div>
                                <FieldLabel required ok={!!formData.role}>
                                    Role / Position
                                </FieldLabel>
                                <Input name="role" value={formData.role} onChange={handleChange} placeholder="e.g. ACCOUNTS EXECUTIVE" className={inp} maxLength={100} />
                                <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.role.length}/100</p>
                            </div>
                        </div>
                    </section>

                    {/* PHOTO */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Member Photo" />

                        <ImageUploader
                            files={files}
                            onChange={(f) => {
                                setFiles(f);
                                handleFileUpload(f);
                            }}
                            maxFiles={1}
                            maxSize={4}
                            accept="image/*"
                        />

                        {uploading && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                            </div>
                        )}

                        <div className="mt-4">
                            <FieldLabel>Stored path</FieldLabel>
                            <Input name="imagePath" value={formData.image} readOnly className={`${inp} font-mono text-[11px] bg-slate-50`} />
                            <p className="mt-1 text-[11px] text-slate-400">Auto-populated after upload.</p>
                        </div>
                    </section>

                    {/* Mobile footer */}
                    <div className="flex sm:hidden gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => router.back()} disabled={loading || uploading} className="flex-1 h-9 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={loading || uploading || !isFormValid} className="flex-1 h-9 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                            {mode === "create" ? "Create" : "Update"}
                        </Button>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="w-full xl:w-64 shrink-0">
                    <div className="xl:sticky xl:top-[108px] space-y-4">
                        {/* Completion */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-600">Completion</span>
                                <span className="text-[11px] text-slate-400">
                                    {completion.filter((c) => c.ok).length}/{completion.length}
                                </span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-3">
                                <div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${completionPct}%` }} />
                            </div>
                            <div className="space-y-1.5">
                                {completion.map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        {item.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 text-slate-200 shrink-0" />}
                                        <span className={`text-[11px] ${item.ok ? "text-slate-600" : "text-slate-400"}`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Grid placement info */}
                        {mode === "create" && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <span className="text-xs font-medium text-blue-700 block mb-2">Grid Placement</span>
                                <p className="text-[11px] text-blue-600 leading-relaxed">
                                    After creating this member, they'll be automatically placed in the next available grid slot. You can rearrange all members from the Team page using the{" "}
                                    <strong>Arrange Layout</strong> button.
                                </p>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <span className="text-xs font-medium text-slate-600 block mb-3">Tips</span>
                            <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                                <li>Use square photos for best grid display.</li>
                                <li>Keep photos under 200 KB for fast load.</li>
                                <li>Use uppercase names to match the team style.</li>
                                <li>Rearrange positions from the Team overview page.</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </form>
        </div>
    );
}
