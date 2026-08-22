"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";
import { ImageUploader } from "@/components/ui/image-uploader";
import TiptapEditor from "@/components/Editor/TiptapEditor";
import { ArrowLeft, Eye, Loader2, X, AlertCircle, CheckCircle2, ChevronRight, Trash2, AlertOctagon } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceImage {
    id?: number;
    image: string;
    title?: string;
}

interface Service {
    id: number;
    title: string;
    url: string;
    description: string;
    content: string;
    image: string;
    bannerImage?: string;
    order: number;
    images?: ServiceImage[];
}

interface ServiceFormProps {
    initialData?: Service;
    serviceId?: number;
    mode: "create" | "edit";
}

// ─── Small UI helpers ─────────────────────────────────────────────────────────

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

// ─── URL helpers ──────────────────────────────────────────────────────────────

/**
 * Permissive — called on every keystroke.
 * Only blocks chars that can never be valid.
 * Allows trailing hyphens so the user can type "design-concept".
 */
const sanitizeUrlInput = (input: string): string => {
    return input
        .toLowerCase()
        .replace(/\s+/g, "-") // spaces → hyphens
        .replace(/[^a-z0-9-]/g, ""); // strip anything that isn't a-z, 0-9, or -
    // ← intentionally NO trailing-hyphen strip here
};

/**
 * Strict — called on blur and before submit.
 * Collapses consecutive hyphens, strips leading/trailing hyphens,
 * and fully validates the result.
 */
const finalizeAndValidateUrl = (input: string): { formatted: string; isValid: boolean; error?: string } => {
    const formatted = input
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-") // collapse consecutive hyphens
        .replace(/^-+|-+$/g, ""); // strip leading / trailing hyphens

    if (!formatted) {
        return { formatted: "", isValid: false, error: "URL cannot be empty" };
    }
    if (formatted.length < 3) {
        return {
            formatted,
            isValid: false,
            error: "URL must be at least 3 characters",
        };
    }
    if (formatted.length > 100) {
        return {
            formatted: formatted.slice(0, 100),
            isValid: false,
            error: "URL must be less than 100 characters",
        };
    }
    if (!/^[a-z0-9]/.test(formatted)) {
        return {
            formatted,
            isValid: false,
            error: "URL must start with a letter or number",
        };
    }
    if (!/[a-z0-9]$/.test(formatted)) {
        return {
            formatted,
            isValid: false,
            error: "URL must end with a letter or number",
        };
    }

    return { formatted, isValid: true };
};

// ─── Gallery grid helper ──────────────────────────────────────────────────────

const getGridLayout = (count: number): string => {
    if (count <= 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-1 grid-rows-2";
    if (count === 3) return "grid-cols-1 grid-rows-3";
    if (count === 4) return "grid-cols-2 grid-rows-2";
    if (count === 5) return "grid-cols-2 grid-rows-3";
    if (count === 6) return "grid-cols-2 grid-rows-3";
    if (count === 7) return "grid-cols-2 grid-rows-4";
    return "grid-cols-2 grid-rows-4"; // 8+
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServiceForm({ initialData, serviceId, mode }: ServiceFormProps) {
    const router = useRouter();
    const toast = useToasts();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [urlCheckLoading, setUrlCheckLoading] = useState(false);
    // For edit mode we wait until data is fetched before rendering the editor
    const [dataLoaded, setDataLoaded] = useState(mode === "create");

    const [files, setFiles] = useState<File[]>([]);
    const [bannerFiles, setBannerFiles] = useState<File[]>([]);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

    const [urlError, setUrlError] = useState<string | null>(null);
    const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        url: "",
        description: "",
        content: "",
        image: "",
        bannerImage: "",
    });

    const [galleryImages, setGalleryImages] = useState<ServiceImage[]>([]);

    // ── Completion ────────────────────────────────────────────────────────────

    const completion = useMemo(
        () => [
            { label: "Title", ok: !!formData.title.trim() },
            {
                label: "URL",
                ok: !!formData.url.trim() && urlAvailable === true,
            },
            { label: "Description", ok: !!formData.description.trim() },
            { label: "Content", ok: !!formData.content.trim() },
            { label: "Main Image", ok: !!formData.image },
            { label: "Banner Image", ok: !!formData.bannerImage },
        ],
        [formData, urlAvailable],
    );

    const completionPct = Math.round((completion.filter((c) => c.ok).length / completion.length) * 100);

    const isFormValid =
        !!formData.title.trim() && !!formData.url.trim() && !!formData.description.trim() && !!formData.content.trim() && !!formData.image && !!formData.bannerImage && urlAvailable === true;

    // ── URL availability check (debounced) ────────────────────────────────────

    useEffect(() => {
        const checkUrl = async () => {
            const raw = formData.url;

            // Nothing typed yet
            if (!raw.trim()) {
                setUrlAvailable(null);
                setUrlError(null);
                return;
            }

            // User is still mid-word (trailing hyphen) — wait silently
            if (raw.endsWith("-")) {
                setUrlAvailable(null);
                setUrlError(null);
                return;
            }

            // Strict validation on the current (possibly unfinished) value
            const validation = finalizeAndValidateUrl(raw);

            if (!validation.isValid) {
                setUrlError(validation.error || "Invalid URL format");
                setUrlAvailable(false);
                return;
            }

            // Skip the network check if editing and URL hasn't changed
            if (mode === "edit" && raw === initialData?.url) {
                setUrlAvailable(true);
                setUrlError(null);
                return;
            }

            setUrlCheckLoading(true);
            setUrlError(null);

            try {
                const response = await axios.get(`/api/services/check-url?url=${encodeURIComponent(validation.formatted)}`);

                if (response.data.available) {
                    setUrlAvailable(true);
                    setUrlError(null);
                } else {
                    setUrlAvailable(false);
                    setUrlError("This URL is already in use");
                }
            } catch {
                setUrlAvailable(false);
                setUrlError("Could not verify URL availability");
            } finally {
                setUrlCheckLoading(false);
            }
        };

        const timer = setTimeout(checkUrl, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.url, mode, initialData?.url]);

    // ── Load service data (edit mode) ─────────────────────────────────────────

    useEffect(() => {
        if (mode !== "edit" || !serviceId) return;

        const load = async () => {
            try {
                const response = await axios.get(`/api/services/${serviceId}`);
                if (response.data.success && response.data.data) {
                    const s = response.data.data;
                    setFormData({
                        title: s.title || "",
                        url: s.url || "",
                        description: s.description || "",
                        content: s.content || "",
                        image: s.image || "",
                        bannerImage: s.bannerImage || "",
                    });
                    setGalleryImages(s.images || []);
                    setUrlAvailable(true);
                }
            } catch {
                toast.error("Failed to load service data");
            } finally {
                setDataLoaded(true);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, serviceId]);

    // ── Field handlers ────────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "url") {
            // ✅ Permissive on keystroke — allows trailing hyphens
            const sanitized = sanitizeUrlInput(value);
            setFormData((p) => ({ ...p, url: sanitized }));
            // Reset availability while user is still editing
            setUrlAvailable(null);
            setUrlError(null);
        } else {
            setFormData((p) => ({ ...p, [name]: value }));
        }
    };

    // ✅ Strict finalization only when user leaves the URL field
    const handleUrlBlur = () => {
        if (!formData.url) return;
        const { formatted } = finalizeAndValidateUrl(formData.url);
        if (formatted !== formData.url) {
            setFormData((p) => ({ ...p, url: formatted }));
        }
    };

    // ── Image upload helpers ──────────────────────────────────────────────────

    const uploadFile = async (file: File): Promise<string | null> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const result = await res.json();
        return result.success ? result.path : null;
    };

    const handleImageUpload = async (uploadedFiles: File[]) => {
        if (!uploadedFiles.length) return;
        setUploading(true);
        try {
            const path = await uploadFile(uploadedFiles[0]);
            if (path) {
                setFormData((p) => ({ ...p, image: path }));
                toast.success("Main image uploaded");
            } else {
                toast.error("Failed to upload image");
                setFiles([]);
            }
        } catch {
            toast.error("Failed to upload image");
            setFiles([]);
        } finally {
            setUploading(false);
        }
    };

    const handleBannerUpload = async (uploadedFiles: File[]) => {
        if (!uploadedFiles.length) return;
        setUploading(true);
        try {
            const path = await uploadFile(uploadedFiles[0]);
            if (path) {
                setFormData((p) => ({ ...p, bannerImage: path }));
                toast.success("Banner image uploaded");
            } else {
                toast.error("Failed to upload banner image");
                setBannerFiles([]);
            }
        } catch {
            toast.error("Failed to upload banner image");
            setBannerFiles([]);
        } finally {
            setUploading(false);
        }
    };

    const handleGalleryUpload = async (uploadedFiles: File[]) => {
        if (!uploadedFiles.length) return;
        setUploading(true);
        try {
            for (const file of uploadedFiles) {
                const path = await uploadFile(file);
                if (path) {
                    setGalleryImages((prev) => [...prev, { image: path, title: file.name.split(".")[0] }]);
                }
            }
            toast.success("Gallery images uploaded");
        } catch {
            toast.error("Failed to upload gallery images");
        } finally {
            setUploading(false);
            setGalleryFiles([]);
        }
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Finalize URL before validation (handles case where user never blurred)
        const { formatted: finalUrl, isValid, error } = finalizeAndValidateUrl(formData.url);

        if (!formData.title.trim()) {
            toast.warning("Please enter a title");
            return;
        }
        if (!formData.url.trim()) {
            toast.warning("Please enter a URL");
            return;
        }
        if (!isValid) {
            toast.warning(error || "Please fix the URL");
            return;
        }
        if (urlAvailable !== true) {
            toast.warning("Please wait for URL validation to complete");
            return;
        }
        if (!formData.description.trim()) {
            toast.warning("Please enter a description");
            return;
        }
        if (!formData.content.trim()) {
            toast.warning("Please enter content");
            return;
        }
        if (!formData.image) {
            toast.warning("Please upload a main image");
            return;
        }
        if (!formData.bannerImage) {
            toast.warning("Please upload a banner image");
            return;
        }

        setLoading(true);
        try {
            const apiUrl = mode === "create" ? "/api/services" : `/api/services/${serviceId}`;

            const res = await fetch(apiUrl, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    url: finalUrl, // ✅ always submit the finalized URL
                    images: galleryImages,
                }),
            });

            const result = await res.json();

            if (result.success) {
                toast.success(mode === "create" ? "Service created!" : "Service updated!");
                setTimeout(() => {
                    router.push("/dashboard/services");
                    router.refresh();
                }, 800);
            } else {
                toast.error(result.message || result.error || "Failed to save service");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Styles ────────────────────────────────────────────────────────────────

    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

    // ── Loading skeleton (edit mode only) ─────────────────────────────────────

    if (!dataLoaded) {
        return (
            <div className="min-h-screen bg-slate-50/60 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    <p className="text-sm text-slate-500">Loading service data…</p>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-slate-50/60">
            {/* ── Sticky topbar ── */}
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

                    <Button type="button" size="sm" onClick={handleSubmit} disabled={loading || uploading || !isFormValid} className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                        {mode === "create" ? "Create" : "Update"}
                    </Button>
                </div>
            </div>

            {/* ── Body ── */}
            <form onSubmit={handleSubmit} className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col xl:flex-row gap-5">
                {/* ── Main column ── */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* BASIC INFO */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Basic Info" />
                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <FieldLabel required ok={!!formData.title}>
                                    Service Title
                                </FieldLabel>
                                <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Design Concept & Strategic Direction" className={inp} maxLength={200} />
                                <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.title.length}/200</p>
                            </div>

                            {/* URL */}
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <FieldLabel required ok={urlAvailable === true}>
                                        URL Slug
                                    </FieldLabel>
                                    {urlCheckLoading && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                                </div>

                                <Input
                                    name="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    onBlur={handleUrlBlur}
                                    placeholder="e.g. design-concept-strategic-direction"
                                    className={`${inp} ${urlError ? "border-red-300 focus:border-red-400" : urlAvailable === true ? "border-emerald-300 focus:border-emerald-400" : ""}`}
                                    maxLength={100}
                                />

                                {/* Validation messages */}
                                <div className="mt-2 space-y-1">
                                    {urlError && (
                                        <div className="flex items-center gap-1.5 text-xs text-red-600">
                                            <AlertOctagon className="h-3 w-3 shrink-0" />
                                            {urlError}
                                        </div>
                                    )}

                                    {urlAvailable === true && formData.url && (
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                                            URL is available
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-500">
                                        URL will be:{" "}
                                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">
                                            /services/
                                            {formData.url || "your-url-slug"}
                                        </code>
                                    </p>
                                    <p className="text-xs text-slate-400">Automatically formats to lowercase. Hyphens are allowed between words.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* DESCRIPTION */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Description" />
                        <p className="text-xs text-slate-500 mb-3">Short description shown in service cards and meta tags.</p>
                        <FieldLabel required ok={!!formData.description}>
                            Description Text
                        </FieldLabel>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter a brief description of this service…"
                            className="w-full h-24 text-sm border border-slate-200 bg-white focus:border-slate-400 focus:outline-none focus:ring-0 rounded-md placeholder:text-slate-300 p-3 resize-none"
                            maxLength={500}
                        />
                        <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.description.length}/500</p>
                    </section>

                    {/* CONTENT */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Content" />
                        <p className="text-xs text-slate-500 mb-3">Rich text content shown on the service detail page.</p>
                        <FieldLabel required ok={!!formData.content}>
                            Rich Text Content
                        </FieldLabel>
                        {dataLoaded && (
                            <TiptapEditor
                                key={`editor-${serviceId ?? "new"}`}
                                content={formData.content}
                                onChange={(c: string) =>
                                    setFormData((p) => ({
                                        ...p,
                                        content: c,
                                    }))
                                }
                            />
                        )}
                    </section>

                    {/* MAIN IMAGE */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Main Image" />
                        <p className="text-xs text-slate-500 mb-3">Shown in service cards. Max 4 MB.</p>

                        <ImageUploader
                            files={files}
                            onChange={(f) => {
                                setFiles(f);
                                handleImageUpload(f);
                            }}
                            maxFiles={1}
                            maxSize={4}
                            accept="image/*"
                        />

                        {uploading && !formData.image && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Uploading…
                            </div>
                        )}

                        {formData.image && (
                            <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100 bg-slate-50 p-4 flex items-center justify-center">
                                <img src={formData.image} alt="Main image preview" className="h-32 w-auto object-cover rounded-md" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData((p) => ({
                                            ...p,
                                            image: "",
                                        }));
                                        setFiles([]);
                                    }}
                                    className="absolute top-2 right-2 p-1 rounded-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </section>

                    {/* BANNER IMAGE */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Banner Image" />
                        <p className="text-xs text-slate-500 mb-3">Background image on the service detail page. Max 4 MB.</p>

                        <ImageUploader
                            files={bannerFiles}
                            onChange={(f) => {
                                setBannerFiles(f);
                                handleBannerUpload(f);
                            }}
                            maxFiles={1}
                            maxSize={4}
                            accept="image/*"
                        />

                        {uploading && !formData.bannerImage && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Uploading…
                            </div>
                        )}

                        {formData.bannerImage && (
                            <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100 bg-slate-50 p-4 flex items-center justify-center">
                                <img src={formData.bannerImage} alt="Banner image preview" className="h-32 w-auto object-cover rounded-md" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData((p) => ({
                                            ...p,
                                            bannerImage: "",
                                        }));
                                        setBannerFiles([]);
                                    }}
                                    className="absolute top-2 right-2 p-1 rounded-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </section>

                    {/* GALLERY */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Gallery Images (Optional)" />
                        <p className="text-xs text-slate-500 mb-3">Add up to 8 images. Grid auto-adjusts based on count.</p>

                        <ImageUploader
                            files={galleryFiles}
                            onChange={(f) => {
                                setGalleryFiles(f);
                                handleGalleryUpload(f);
                            }}
                            maxFiles={8}
                            maxSize={4}
                            accept="image/*"
                        />

                        {uploading && galleryFiles.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Uploading…
                            </div>
                        )}

                        {galleryImages.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-medium text-slate-600 mb-3">Gallery ({galleryImages.length}/8 images)</p>
                                <div className={`grid ${getGridLayout(galleryImages.length)} gap-2.5`}>
                                    {galleryImages.map((img, idx) => (
                                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-100 bg-slate-50 aspect-video">
                                            <img src={img.image} alt={img.title || `Gallery image ${idx + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 p-1 rounded-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Mobile footer */}
                    <div className="flex sm:hidden gap-2 pb-6">
                        <Button type="button" variant="outline" size="sm" onClick={() => router.back()} disabled={loading || uploading} className="flex-1 h-9 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={loading || uploading || !isFormValid} className="flex-1 h-9 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                            {mode === "create" ? "Create" : "Update"}
                        </Button>
                    </div>
                </div>

                {/* ── Sidebar ── */}
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
                                <li className="flex items-start gap-1.5">
                                    <span className="text-slate-300 mt-px">·</span>
                                    URL slug must be unique across all services.
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-slate-300 mt-px">·</span>
                                    Hyphens are allowed between words (e.g. <code className="font-mono">my-service</code>
                                    ).
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-slate-300 mt-px">·</span>
                                    Description: brief text for service cards.
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-slate-300 mt-px">·</span>
                                    Content: detailed rich text for service page.
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-slate-300 mt-px">·</span>
                                    Gallery auto-adjusts grid based on image count.
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-slate-300 mt-px">·</span>
                                    Banner appears as background on service page.
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </form>
        </div>
    );
}
