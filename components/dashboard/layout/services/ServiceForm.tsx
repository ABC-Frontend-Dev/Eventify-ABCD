"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToasts } from "@/components/ui/toast";
import { ArrowLeft, Save, Loader2, X, AlertCircle, CheckCircle2, Eye, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ServiceFormProps {
    initialData?: {
        title: string;
        description: string;
        image: string;
        url: string;
        order?: number;
    };
    serviceId?: number;
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

export default function ServiceForm({ initialData, serviceId, mode }: ServiceFormProps) {
    const router = useRouter();
    const toast = useToasts();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        image: initialData?.image || "",
        url: initialData?.url || "",
    });

    const completion = useMemo(
        () => [
            { label: "Service Title", ok: !!formData.title.trim() },
            { label: "Description", ok: !!formData.description.trim() },
            { label: "Image", ok: !!formData.image },
            { label: "URL", ok: !!formData.url.trim() },
        ],
        [formData],
    );

    const completionPct = Math.round((completion.filter((c) => c.ok).length / completion.length) * 100);
    const isFormValid = completion.every((c) => c.ok);

    useEffect(() => {
        if (mode !== "edit" || !serviceId) return;
        fetch(`/api/services/${serviceId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success && data.data) {
                    setFormData({
                        title: data.data.title,
                        description: data.data.description,
                        image: data.data.image,
                        url: data.data.url,
                    });
                }
            })
            .catch(() => toast.error("Failed to load service data"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, serviceId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleFileUpload = async (uploadedFiles: File[]) => {
        if (!uploadedFiles.length) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", uploadedFiles[0]);
            const res = await fetch("/api/upload?folder=services", {
                method: "POST",
                body: fd,
            });
            const result = await res.json();
            if (result.success) {
                setFormData((p) => ({ ...p, image: result.path }));
                toast.success("Image uploaded");
            } else toast.error(result.error || "Failed to upload image");
        } catch {
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.warning("Please enter a service title");
            return;
        }
        if (!formData.description.trim()) {
            toast.warning("Please enter a description");
            return;
        }
        if (!formData.image.trim()) {
            toast.warning("Please upload an image");
            return;
        }
        if (!formData.url.trim()) {
            toast.warning("Please enter a URL");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(mode === "create" ? "/api/services" : `/api/services/${serviceId}`, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await res.json();
            if (result.success) {
                toast.success(mode === "create" ? "Service created!" : "Service updated!");
                setTimeout(() => {
                    router.push("/dashboard/services");
                    router.refresh();
                }, 800);
            } else toast.error(result.message || result.error || "Failed to save");
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
                        <Link href="/dashboard/services">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>

                    <div className="h-4 w-px bg-slate-200" />

                    <span className="text-xs text-slate-400">Services</span>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{mode === "create" ? "New service" : formData.title || "Edit service"}</span>

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

                    <Button type="button" size="sm" onClick={handleSubmit} disabled={loading || uploading || !isFormValid} className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                        {mode === "create" ? "Create" : "Update"}
                    </Button>
                </div>
            </div>

            {/* Body */}
            <form id="service-form" onSubmit={handleSubmit} className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col xl:flex-row gap-5">
                {/* Main column */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* SERVICE INFO */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Service Info" />
                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <FieldLabel required ok={!!formData.title}>
                                    Service Title
                                </FieldLabel>
                                <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Live Event Production" className={inp} maxLength={100} />
                                <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.title.length}/100</p>
                            </div>

                            {/* Description */}
                            <div>
                                <FieldLabel required ok={!!formData.description}>
                                    Description
                                </FieldLabel>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Detailed description of the service…"
                                    rows={4}
                                    className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                                    maxLength={500}
                                />
                                <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.description.length}/500</p>
                            </div>

                            {/* URL */}
                            <div>
                                <FieldLabel required ok={!!formData.url}>
                                    URL Path
                                </FieldLabel>
                                <Input name="url" value={formData.url} onChange={handleChange} placeholder="e.g. services/live-events" className={inp} />
                                <p className="mt-1 text-[11px] text-slate-400">Used for navigation link</p>
                            </div>
                        </div>
                    </section>

                    {/* IMAGE */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Service Image" />

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

                        {formData.image && !uploading && (
                            <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100 bg-slate-50 p-4 flex items-center justify-center h-40">
                                <img src={formData.image} alt="Image preview" className="h-full w-auto max-w-full object-contain" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData((p) => ({ ...p, image: "" }));
                                        setFiles([]);
                                    }}
                                    className="absolute top-2 right-2 p-1 rounded-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}

                        <div className="mt-4">
                            <FieldLabel>Stored path</FieldLabel>
                            <Input
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="/images/services/image.webp"
                                readOnly
                                className={`${inp} font-mono text-[11px] bg-slate-50`}
                            />
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

                        {/* Tips */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <span className="text-xs font-medium text-slate-600 block mb-3">Tips</span>
                            <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                                <li>Use landscape images (16:9) for best display.</li>
                                <li>Keep image under 500 KB for fast load.</li>
                                <li>Description should be under 160 characters.</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </form>
        </div>
    );
}
