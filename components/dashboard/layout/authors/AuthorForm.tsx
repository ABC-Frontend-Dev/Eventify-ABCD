// dashboard/components/layout/authors/AuthorForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToasts } from "@/components/ui/toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DashboardHeader from "../common/Header";

// ─── Role options ─────────────────────────────────────────────────────────────
const ROLE_OPTIONS = ["Author", "Senior Author", "Editor", "Chief Editor", "Contributor", "Guest Author"];

interface AuthorFormProps {
    initialData?: {
        name: string;
        email: string;
        role?: string;
        bio?: string;
        avatar?: string;
    };
    authorId?: number;
    mode: "create" | "edit";
}

export default function AuthorForm({ initialData, authorId, mode }: AuthorFormProps) {
    const router = useRouter();
    const toast = useToasts();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        role: initialData?.role || "Author", // ← new required field
        bio: initialData?.bio || "",
        avatar: initialData?.avatar || "",
    });

    // ── Edit mode: fetch latest ───────────────────────────────────────────────
    useEffect(() => {
        if (mode !== "edit" || !authorId) return;
        fetch(`/api/authors/${authorId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.data) {
                    setFormData({
                        name: data.data.name,
                        email: data.data.email,
                        role: data.data.role || "Author",
                        bio: data.data.bio || "",
                        avatar: data.data.avatar || "",
                    });
                }
            })
            .catch(() => toast.error("Failed to load author data")); // toast used but NOT in deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, authorId]); // ✅ toast removed from deps

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ── Avatar upload ─────────────────────────────────────────────────────────
    const handleFileUpload = async (uploadedFiles: File[]) => {
        if (!uploadedFiles.length) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", uploadedFiles[0]);
            const response = await fetch("/api/upload?folder=authors", {
                method: "POST",
                body: fd,
            });
            const result = await response.json();
            if (result.success) {
                setFormData((prev) => ({ ...prev, avatar: result.path }));
                toast.success("Avatar uploaded successfully!");
            } else {
                toast.error(result.error || "Failed to upload avatar");
                setFiles([]);
            }
        } catch {
            toast.error("Failed to upload avatar");
            setFiles([]);
        } finally {
            setUploading(false);
        }
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.warning("Please enter an author name");
            return;
        }
        if (!formData.email.trim()) {
            toast.warning("Please enter an author email");
            return;
        }
        if (!formData.role.trim()) {
            toast.warning("Please select a role");
            return;
        }
        if (!formData.avatar.trim()) {
            toast.warning("Please upload an author avatar");
            return;
        }

        setLoading(true);
        try {
            const url = mode === "create" ? "/api/authors" : `/api/authors/${authorId}`;

            const response = await fetch(url, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await response.json();

            if (result.success) {
                toast.success(mode === "create" ? "Author created successfully!" : "Author updated successfully!");
                setTimeout(() => {
                    router.push("/dashboard/authors");
                    router.refresh();
                }, 1000);
            } else {
                toast.error(result.message || result.error || "Failed to save author");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inp = "h-9 w-full px-3 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-400 placeholder:text-slate-300";
    const sel = "h-9 w-full px-3 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-400 text-slate-700";

    return (
        <div className="max-w-2xl w-full mx-auto space-y-6">
            {/* Back + header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/authors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <DashboardHeader title={mode === "create" ? "Add New Author" : "Edit Author"} description={mode === "create" ? "Create a new author entry" : "Update existing author information"} />
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">
                        Author Name <span className="text-red-400">*</span>
                    </label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Jumana Samy" required className={inp} />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">
                        Author Email <span className="text-red-400">*</span>
                    </label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g. jumana@eventifyentertainment.com" required className={inp} />
                </div>

                {/* Role — required */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">
                        Role <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                        {/* Predefined select */}
                        <select
                            name="role"
                            value={ROLE_OPTIONS.includes(formData.role) ? formData.role : "custom"}
                            onChange={(e) => {
                                if (e.target.value !== "custom") {
                                    setFormData((p) => ({
                                        ...p,
                                        role: e.target.value,
                                    }));
                                }
                            }}
                            className={`${sel} flex-1`}
                        >
                            {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                            <option value="custom">Custom…</option>
                        </select>

                        {/* Free-text override */}
                        <input name="role" value={formData.role} onChange={handleChange} placeholder="or type custom role" className={`${inp} flex-1`} />
                    </div>
                    <p className="text-[11px] text-slate-400">Select a preset or type a custom role. This appears on published blogs.</p>
                </div>

                {/* Avatar uploader */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">
                        Author Avatar <span className="text-red-400">*</span>
                    </label>
                    <ImageUploader
                        files={files}
                        onChange={(newFiles) => {
                            setFiles(newFiles);
                            handleFileUpload(newFiles);
                        }}
                        maxFiles={1}
                        maxSize={4}
                        accept="image/*"
                    />
                    {uploading && (
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Uploading image…
                        </p>
                    )}
                </div>

                {/* Avatar preview */}
                {formData.avatar && !uploading && (
                    <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden border border-slate-200 shrink-0">
                            <Image src={formData.avatar} alt={formData.name || "Avatar preview"} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{formData.name || "Author"}</p>
                            <p className="text-[11px] text-slate-400 truncate">{formData.role}</p>
                            <p className="text-[10px] text-slate-300 mt-0.5 truncate font-mono">{formData.avatar}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData((p) => ({ ...p, avatar: "" }));
                                setFiles([]);
                            }}
                            className="ml-auto text-slate-400 hover:text-red-500 transition-colors shrink-0"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Bio */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">
                        Bio <span className="text-slate-300 font-normal">(optional)</span>
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about the author…"
                        rows={4}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-400 resize-none placeholder:text-slate-300"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={loading || uploading} className="flex-1 bg-slate-900 hover:bg-slate-700 text-white">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {loading ? (mode === "create" ? "Creating…" : "Updating…") : mode === "create" ? "Create Author" : "Update Author"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading || uploading}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
