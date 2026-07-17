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
import Image from "next/image";

interface ComparisonFormProps {
    initialData?: {
        title: string;
        beforeImage: string;
        afterImage: string;
    };
    comparisonId?: number;
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

export default function ComparisonForm({ initialData, comparisonId, mode }: ComparisonFormProps) {
    const router = useRouter();
    const toast = useToasts();

    const [loading, setLoading] = useState(false);
    const [uploadingBefore, setUploadingBefore] = useState(false);
    const [uploadingAfter, setUploadingAfter] = useState(false);
    const [beforeFiles, setBeforeFiles] = useState<File[]>([]);
    const [afterFiles, setAfterFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        beforeImage: initialData?.beforeImage || "",
        afterImage: initialData?.afterImage || "",
    });

    const completion = useMemo(
        () => [
            { label: "Title", ok: !!formData.title.trim() },
            { label: "Before Image", ok: !!formData.beforeImage },
            { label: "After Image", ok: !!formData.afterImage },
        ],
        [formData],
    );

    const completionPct = Math.round((completion.filter((c) => c.ok).length / completion.length) * 100);
    const isFormValid = completion.every((c) => c.ok);

    useEffect(() => {
        if (mode !== "edit" || !comparisonId) return;
        fetch(`/api/comparisons/${comparisonId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success && data.data) {
                    setFormData({
                        title: data.data.title,
                        beforeImage: data.data.beforeImage,
                        afterImage: data.data.afterImage,
                    });
                }
            })
            .catch(() => toast.error("Failed to load comparison data"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, comparisonId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload?folder=comparisons", {
            method: "POST",
            body: fd,
        });
        const result = await res.json();
        return result.success ? result.path : null;
    };

    const handleBeforeImageUpload = async (files: File[]) => {
        if (!files.length) return;
        setUploadingBefore(true);
        const path = await uploadFile(files[0]).catch(() => null);
        setUploadingBefore(false);
        setBeforeFiles([]);
        if (path) {
            setFormData((p) => ({ ...p, beforeImage: path }));
            toast.success("Before image uploaded");
        } else toast.error("Failed to upload before image");
    };

    const handleAfterImageUpload = async (files: File[]) => {
        if (!files.length) return;
        setUploadingAfter(true);
        const path = await uploadFile(files[0]).catch(() => null);
        setUploadingAfter(false);
        setAfterFiles([]);
        if (path) {
            setFormData((p) => ({ ...p, afterImage: path }));
            toast.success("After image uploaded");
        } else toast.error("Failed to upload after image");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.warning("Please complete all required fields");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(mode === "create" ? "/api/comparisons" : `/api/comparisons/${comparisonId}`, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await res.json();
            if (result.success) {
                toast.success(mode === "create" ? "Comparison created!" : "Comparison updated!");
                setTimeout(() => {
                    router.push("/dashboard/comparisons");
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
                        <Link href="/dashboard/comparisons">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>

                    <div className="h-4 w-px bg-slate-200" />

                    <span className="text-xs text-slate-400">Comparisons</span>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{mode === "create" ? "New comparison" : formData.title || "Edit comparison"}</span>

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
                        disabled={loading || uploadingBefore || uploadingAfter}
                        className="h-7 text-xs text-slate-500 hover:text-slate-900 hidden sm:inline-flex"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={loading || uploadingBefore || uploadingAfter || !isFormValid}
                        className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                    >
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                        {mode === "create" ? "Create" : "Update"}
                    </Button>
                </div>
            </div>

            {/* Body */}
            <form id="comparison-form" onSubmit={handleSubmit} className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col xl:flex-row gap-5">
                {/* Main column */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* COMPARISON INFO */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Comparison Info" />
                        <div className="space-y-4">
                            <div>
                                <FieldLabel required ok={!!formData.title.trim()}>
                                    Comparison Title
                                </FieldLabel>
                                <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Event Setup - Before & After" className={inp} maxLength={100} />
                                <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.title.length}/100</p>
                            </div>
                        </div>
                    </section>

                    {/* BEFORE IMAGE */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Before Image" />

                        <ImageUploader
                            files={beforeFiles}
                            onChange={(f) => {
                                setBeforeFiles(f);
                                handleBeforeImageUpload(f);
                            }}
                            maxFiles={1}
                            maxSize={10}
                            accept="image/*"
                        />

                        {uploadingBefore && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                            </div>
                        )}

                        {formData.beforeImage && !uploadingBefore && (
                            <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100 h-40">
                                <Image src={formData.beforeImage} alt="Before image" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((p) => ({
                                            ...p,
                                            beforeImage: "",
                                        }))
                                    }
                                    className="absolute top-2 right-2 p-1 rounded-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </section>

                    {/* AFTER IMAGE */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="After Image" />

                        <ImageUploader
                            files={afterFiles}
                            onChange={(f) => {
                                setAfterFiles(f);
                                handleAfterImageUpload(f);
                            }}
                            maxFiles={1}
                            maxSize={10}
                            accept="image/*"
                        />

                        {uploadingAfter && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                            </div>
                        )}

                        {formData.afterImage && !uploadingAfter && (
                            <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100 h-40">
                                <Image src={formData.afterImage} alt="After image" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((p) => ({
                                            ...p,
                                            afterImage: "",
                                        }))
                                    }
                                    className="absolute top-2 right-2 p-1 rounded-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Mobile footer */}
                    <div className="flex sm:hidden gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => router.back()} disabled={loading || uploadingBefore || uploadingAfter} className="flex-1 h-9 text-xs">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading || uploadingBefore || uploadingAfter || !isFormValid}
                            className="flex-1 h-9 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                        >
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
                                <li>Use same sized images for best comparison</li>
                                <li>Landscape images work best (16:9)</li>
                                <li>Keep images under 500 KB each</li>
                                <li>Use clear, descriptive titles</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </form>
        </div>
    );
}
