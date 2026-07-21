"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToasts } from "@/components/ui/toast";
import { ImageUploader } from "@/components/ui/image-uploader";
import TiptapEditor from "@/components/Editor/TiptapEditor";
import { ArrowLeft, Eye, Loader2, X, AlertCircle, CheckCircle2, ChevronRight, Trash2, AlertOctagon } from "lucide-react";
import Link from "next/link";

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

// URL validation and formatting function
const formatAndValidateUrl = (input: string): { formatted: string; isValid: boolean; error?: string } => {
    // Convert to lowercase
    let formatted = input.toLowerCase().trim();

    // Remove spaces and replace with hyphens
    formatted = formatted.replace(/\s+/g, "-");

    // Remove special characters except hyphens
    formatted = formatted.replace(/[^a-z0-9-]/g, "");

    // Remove consecutive hyphens
    formatted = formatted.replace(/-+/g, "-");

    // Remove leading and trailing hyphens
    formatted = formatted.replace(/^-+|-+$/g, "");

    // Validate format
    if (!formatted) {
        return { formatted: "", isValid: false, error: "URL cannot be empty" };
    }

    if (formatted.length < 3) {
        return { formatted, isValid: false, error: "URL must be at least 3 characters" };
    }

    if (formatted.length > 100) {
        return { formatted: formatted.slice(0, 100), isValid: false, error: "URL must be less than 100 characters" };
    }

    if (!/^[a-z0-9]/.test(formatted)) {
        return { formatted, isValid: false, error: "URL must start with a letter or number" };
    }

    if (!/[a-z0-9]$/.test(formatted)) {
        return { formatted, isValid: false, error: "URL must end with a letter or number" };
    }

    return { formatted, isValid: true };
};

export default function ServiceForm({ initialData, serviceId, mode }: ServiceFormProps) {
    const router = useRouter();
    const toast = useToasts();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [urlCheckLoading, setUrlCheckLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(mode === "create"); // True for create, false for edit
    const [files, setFiles] = useState<File[]>([]);
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

    const completion = useMemo(
        () => [
            { label: "Title", ok: !!formData.title.trim() },
            { label: "URL", ok: !!formData.url.trim() && urlAvailable === true },
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

    // Check URL availability with debounce
    useEffect(() => {
        const checkUrlAvailability = async () => {
            if (!formData.url.trim()) {
                setUrlAvailable(null);
                setUrlError(null);
                return;
            }

            const validation = formatAndValidateUrl(formData.url);

            if (!validation.isValid) {
                setUrlError(validation.error || "Invalid URL format");
                setUrlAvailable(false);
                return;
            }

            setUrlCheckLoading(true);
            setUrlError(null);

            try {
                // Check if URL exists (skip check if editing and URL hasn't changed)
                if (mode === "edit" && formData.url === initialData?.url) {
                    setUrlAvailable(true);
                    setUrlCheckLoading(false);
                    return;
                }

                const response = await axios.get(`/api/services/check-url?url=${encodeURIComponent(validation.formatted)}`);

                if (response.data.available) {
                    setUrlAvailable(true);
                    setUrlError(null);
                } else {
                    setUrlAvailable(false);
                    setUrlError("This URL is already in use");
                }
            } catch (error) {
                console.error("Error checking URL:", error);
                setUrlAvailable(false);
                setUrlError("Could not verify URL availability");
            } finally {
                setUrlCheckLoading(false);
            }
        };

        const timer = setTimeout(checkUrlAvailability, 500);
        return () => clearTimeout(timer);
    }, [formData.url, mode, initialData?.url]);

    // Load service data for edit mode
    useEffect(() => {
        if (mode === "edit" && serviceId) {
            const loadService = async () => {
                try {
                    const response = await axios.get(`/api/services/${serviceId}`);
                    if (response.data.success && response.data.data) {
                        const service = response.data.data;
                        setFormData({
                            title: service.title || "",
                            url: service.url || "",
                            description: service.description || "",
                            content: service.content || "",
                            image: service.image || "",
                            bannerImage: service.bannerImage || "",
                        });
                        setGalleryImages(service.images || []);
                        setUrlAvailable(true);
                        setDataLoaded(true); // Mark data as loaded
                    }
                } catch (error) {
                    console.error("Error loading service:", error);
                    toast.error("Failed to load service data");
                    setDataLoaded(true); // Still mark as loaded even on error
                }
            };
            loadService();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, serviceId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "url") {
            const { formatted } = formatAndValidateUrl(value);
            setFormData((p) => ({ ...p, [name]: formatted }));
        } else {
            setFormData((p) => ({ ...p, [name]: value }));
        }
    };

    // Main image upload
    const handleImageUpload = async (uploadedFiles: File[]) => {
        if (!uploadedFiles.length) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", uploadedFiles[0]);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const result = await res.json();
            if (result.success) {
                setFormData((p) => ({ ...p, image: result.path }));
                toast.success("Main image uploaded");
            } else {
                toast.error(result.error || "Failed to upload image");
            }
        } catch {
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    // Banner image upload
    const handleBannerUpload = async (uploadedFiles: File[]) => {
        if (!uploadedFiles.length) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", uploadedFiles[0]);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const result = await res.json();
            if (result.success) {
                setFormData((p) => ({ ...p, bannerImage: result.path }));
                toast.success("Banner image uploaded");
            } else {
                toast.error(result.error || "Failed to upload banner image");
            }
        } catch {
            toast.error("Failed to upload banner image");
        } finally {
            setUploading(false);
        }
    };

    // Gallery images upload
    const handleGalleryUpload = async (uploadedFiles: File[]) => {
        if (!uploadedFiles.length) return;
        setUploading(true);
        try {
            for (const file of uploadedFiles) {
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                const result = await res.json();
                if (result.success) {
                    setGalleryImages((prev) => [
                        ...prev,
                        {
                            image: result.path,
                            title: file.name.split(".")[0],
                        },
                    ]);
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

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.warning("Please enter a title");
            return;
        }
        if (!formData.url.trim()) {
            toast.warning("Please enter a URL");
            return;
        }
        if (urlAvailable !== true) {
            toast.warning("Please fix the URL validation error");
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
        if (!formData.image.trim()) {
            toast.warning("Please upload a main image");
            return;
        }
        if (!formData.bannerImage.trim()) {
            toast.warning("Please upload a banner image");
            return;
        }

        setLoading(true);
        try {
            const url = mode === "create" ? "/api/services" : `/api/services/${serviceId}`;
            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
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

    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

    // Calculate grid layout based on image count
    const getGridLayout = (count: number) => {
        if (count === 0) return "grid-cols-1 grid-rows-1";
        if (count === 1) return "grid-cols-1 grid-rows-1";
        if (count === 2) return "grid-cols-1 grid-rows-2";
        if (count === 3) return "grid-cols-1 grid-rows-3";
        if (count === 4) return "grid-cols-2 grid-rows-2";
        if (count === 5) return "grid-cols-2 grid-rows-3";
        if (count === 6) return "grid-cols-2 grid-rows-3";
        if (count === 7) return "grid-cols-2 grid-rows-4";
        if (count === 8) return "grid-cols-2 grid-rows-4";
        return "grid-cols-2 grid-rows-4";
    };

    // Show loading while data is being loaded in edit mode
    if (!dataLoaded) {
        return (
            <div className="min-h-screen bg-slate-50/60 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    <p className="text-sm text-slate-500">Loading service data...</p>
                </div>
            </div>
        );
    }

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

                    {/* Progress pill */}
                    <div className="hidden md:flex items-center gap-2 ml-3">
                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${completionPct}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-400">{completionPct}%</span>
                    </div>

                    <div className="flex-1" />

                    {/* Cancel */}
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

                    {/* Save */}
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
                                    placeholder="e.g. design-concept-strategic-direction"
                                    className={`${inp} ${urlError ? "border-red-300 focus:border-red-400" : urlAvailable === true ? "border-emerald-300 focus:border-emerald-400" : ""}`}
                                    maxLength={100}
                                />

                                {/* URL Validation Messages */}
                                <div className="mt-2 space-y-1">
                                    {urlError && (
                                        <div className="flex items-center gap-1.5 text-xs text-red-600">
                                            <AlertOctagon className="h-3 w-3" />
                                            {urlError}
                                        </div>
                                    )}

                                    {urlAvailable === true && formData.url && (
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                                            <CheckCircle2 className="h-3 w-3" />
                                            URL is available
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-500">
                                        URL will be: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">/services/{formData.url || "your-url-slug"}</code>
                                    </p>
                                    <p className="text-xs text-slate-400">Automatically formats to lowercase, removes special characters and spaces</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* DESCRIPTION */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Description" />
                        <p className="text-xs text-slate-500 mb-3">Short description (shown in service cards and meta tags)</p>
                        <FieldLabel required ok={!!formData.description}>
                            Description Text
                        </FieldLabel>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter a brief description of this service..."
                            className="w-full h-24 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300 border p-3 resize-none"
                            maxLength={500}
                        />
                        <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.description.length}/500</p>
                    </section>

                    {/* CONTENT */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Content" />
                        <p className="text-xs text-slate-500 mb-3">Rich text content (shown on service detail page)</p>
                        <FieldLabel required ok={!!formData.content}>
                            Rich Text Content
                        </FieldLabel>
                        {dataLoaded && (
                            <TiptapEditor
                                key={`editor-${formData.content}`}
                                content={formData.content}
                                onChange={(content: any) =>
                                    setFormData((p) => ({
                                        ...p,
                                        content: content,
                                    }))
                                }
                            />
                        )}
                    </section>

                    {/* MAIN IMAGE */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Main Image" />

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

                        {uploading && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                            </div>
                        )}

                        {formData.image && !uploading && (
                            <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100 bg-slate-50 p-4 flex items-center justify-center">
                                <img src={formData.image} alt="Main image preview" className="h-32 w-32 object-cover rounded-md" />
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
                        <SectionHeading label="Banner Image (Background)" />

                        <ImageUploader
                            files={files}
                            onChange={(f) => {
                                setFiles(f);
                                handleBannerUpload(f);
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

                        {formData.bannerImage && !uploading && (
                            <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100 bg-slate-50 p-4 flex items-center justify-center">
                                <img src={formData.bannerImage} alt="Banner image preview" className="h-32 w-32 object-cover rounded-md" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData((p) => ({
                                            ...p,
                                            bannerImage: "",
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

                    {/* GALLERY IMAGES */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Gallery Images (Optional)" />
                        <p className="text-xs text-slate-500 mb-3">Add up to 8 images. Grid will auto-adjust based on number of images.</p>

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

                        {uploading && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                            </div>
                        )}

                        {galleryImages.length > 0 && !uploading && (
                            <div className="mt-4">
                                <p className="text-xs font-medium text-slate-600 mb-3">Gallery ({galleryImages.length}/8 images)</p>
                                <div className={`grid ${getGridLayout(galleryImages.length)} gap-2.5`}>
                                    {galleryImages.map((img, idx) => (
                                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                            <img src={img.image} alt={img.title || `Gallery image ${idx + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
                                                }}
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
                                <li>
                                    <strong>Description:</strong> Brief text for service cards
                                </li>
                                <li>
                                    <strong>Content:</strong> Detailed rich text for service page
                                </li>
                                <li>URL slug must be unique across all services.</li>
                                <li>Spaces and special characters are automatically removed.</li>
                                <li>Gallery images auto-adjust grid layout based on count.</li>
                                <li>Banner image appears as background on service page.</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </form>
        </div>
    );
}
