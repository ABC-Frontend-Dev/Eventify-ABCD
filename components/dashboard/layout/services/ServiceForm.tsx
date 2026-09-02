"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToasts } from "@/components/ui/toast";
import TiptapEditor from "@/components/Editor/TiptapEditor";
import {
    Loader2, X, CheckCircle2, AlertCircle, Plus, Trash2,
    Video, Images, ChevronDown, ChevronUp, Eye, Save,
    ArrowLeft, ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComparisonPair {
    id?: number;
    beforeImage: string;
    beforeAlt: string;
    afterImage: string;
    afterAlt: string;
    _uploadingBefore?: boolean;
    _uploadingAfter?: boolean;
}

interface ServiceFormData {
    id?: number;
    title: string;
    url: string;
    breadcrumb: string;
    description: string;
    content: string;
    bannerImage: string;
    bannerImageAlt: string;
    mediaType: "image" | "video";
    videoUrl: string;
    videoPoster: string;
    comparisonImages: ComparisonPair[];
}

interface ServiceFormProps {
    mode: "create" | "edit";
    serviceId?: number;
    initialData?: {
        id: number;
        title: string;
        url: string;
        breadcrumb: string;
        description: string | null;
        content: string;
        bannerImage: string;
        bannerImageAlt: string | null;
        mediaType: string;
        videoUrl: string | null;
        videoPoster: string | null;
        comparisonImages: {
            id: number;
            beforeImage: string;
            beforeAlt: string | null;
            afterImage: string;
            afterAlt: string | null;
        }[];
    };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_BANNER_MB = 5;
const MAX_COMPARISON_MB = 5;
const MAX_VIDEO_MB = 100;

const NAV = [
    { id: "basic", label: "Basic Info" },
    { id: "banner", label: "Banner" },
    { id: "content", label: "Content" },
    { id: "media", label: "Media" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldLabel({
    children,
    required,
    ok,
}: {
    children: React.ReactNode;
    required?: boolean;
    ok?: boolean;
}) {
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
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                {label}
            </span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );
}

function slugify(text: string) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function ServiceForm({ mode, serviceId, initialData }: ServiceFormProps) {
    const router = useRouter();
    const toast = useToasts();
    const isEdit = mode === "edit";

    // ── UI state ──────────────────────────────────────────────────────────────
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState("basic");
    const [showMediaSection, setShowMediaSection] = useState(true);

    // ── URL check state ───────────────────────────────────────────────────────
    const [checkingUrl, setCheckingUrl] = useState(false);
    const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null);
    const [urlManuallyEdited, setUrlManuallyEdited] = useState(false);

    // ── Upload state ──────────────────────────────────────────────────────────
    const [bannerFiles, setBannerFiles] = useState<File[]>([]);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [posterFiles, setPosterFiles] = useState<File[]>([]);
    const [uploadingPoster, setUploadingPoster] = useState(false);

    // ── Editor content ────────────────────────────────────────────────────────
    const [editorContent, setEditorContent] = useState("");

    // ── Form state ────────────────────────────────────────────────────────────
    const [form, setForm] = useState<ServiceFormData>({
        title: "",
        url: "",
        breadcrumb: "",
        description: "",
        content: "",
        bannerImage: "",
        bannerImageAlt: "",
        mediaType: "image",
        videoUrl: "",
        videoPoster: "",
        comparisonImages: [],
    });

    // ── Populate form in edit mode ─────────────────────────────────────────
    useEffect(() => {
        if (initialData) {
            const data: ServiceFormData = {
                id: initialData.id,
                title: initialData.title,
                url: initialData.url,
                breadcrumb: initialData.breadcrumb || initialData.title,
                description: initialData.description || "",
                content: initialData.content,
                bannerImage: initialData.bannerImage,
                bannerImageAlt: initialData.bannerImageAlt || "",
                mediaType: (initialData.mediaType as "image" | "video") || "image",
                videoUrl: initialData.videoUrl || "",
                videoPoster: initialData.videoPoster || "",
                comparisonImages: (initialData.comparisonImages || []).map((img) => ({
                    id: img.id,
                    beforeImage: img.beforeImage,
                    beforeAlt: img.beforeAlt || "",
                    afterImage: img.afterImage,
                    afterAlt: img.afterAlt || "",
                })),
            };
            setForm(data);
            setEditorContent(initialData.content);
            setUrlAvailable(true);
            setUrlManuallyEdited(true);
        }
    }, [initialData]);

    // Fetch full data in edit mode (if only ID is passed)
    useEffect(() => {
        if (mode !== "edit" || !serviceId || initialData) return;
        fetch(`/api/services/${serviceId}`)
            .then((r) => r.json())
            .then((data) => {
                if (!data.success) { toast.error("Failed to load service"); return; }
                const s = data.data;
                const formData: ServiceFormData = {
                    id: s.id,
                    title: s.title,
                    url: s.url,
                    breadcrumb: s.breadcrumb || s.title,
                    description: s.description || "",
                    content: s.content,
                    bannerImage: s.bannerImage,
                    bannerImageAlt: s.bannerImageAlt || "",
                    mediaType: s.mediaType || "image",
                    videoUrl: s.videoUrl || "",
                    videoPoster: s.videoPoster || "",
                    comparisonImages: (s.comparisonImages || []).map((img: any) => ({
                        id: img.id,
                        beforeImage: img.beforeImage,
                        beforeAlt: img.beforeAlt || "",
                        afterImage: img.afterImage,
                        afterAlt: img.afterAlt || "",
                    })),
                };
                setForm(formData);
                setEditorContent(s.content);
                setUrlAvailable(true);
                setUrlManuallyEdited(true);
            })
            .catch(() => toast.error("Failed to load service"));
    }, [mode, serviceId, initialData]);

    // ── Auto-generate URL from title ───────────────────────────────────────
    useEffect(() => {
        if (!urlManuallyEdited && form.title) {
            setForm((p) => ({ ...p, url: slugify(p.title) }));
        }
    }, [form.title, urlManuallyEdited]);

    // ── Auto-populate breadcrumb from title ────────────────────────────────
    useEffect(() => {
        if (!isEdit) {
            setForm((p) => ({ ...p, breadcrumb: p.title }));
        }
    }, [form.title, isEdit]);

    // ── URL availability check ─────────────────────────────────────────────
    const checkUrl = useCallback(
        async (url: string) => {
            if (!url || (isEdit && url === initialData?.url)) {
                setUrlAvailable(isEdit ? true : null);
                return;
            }
            setCheckingUrl(true);
            try {
                const res = await fetch(`/api/services/check-url?url=${encodeURIComponent(url)}`);
                const data = await res.json();
                setUrlAvailable(data.available);
            } catch {
                setUrlAvailable(null);
            } finally {
                setCheckingUrl(false);
            }
        },
        [isEdit, initialData?.url]
    );

    useEffect(() => {
        const timer = setTimeout(() => { if (form.url) checkUrl(form.url); }, 500);
        return () => clearTimeout(timer);
    }, [form.url, checkUrl]);

    // ── Upload helpers ─────────────────────────────────────────────────────
    const uploadFile = async (file: File, folder: string): Promise<string | null> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`/api/upload?folder=${folder}`, { method: "POST", body: fd });
        const result = await res.json();
        return result.success ? result.path : null;
    };

    const handleBannerUpload = async (files: File[]) => {
        if (!files.length) return;
        const file = files[0];
        if (file.size > MAX_BANNER_MB * 1024 * 1024) {
            toast.error(`Banner image must be under ${MAX_BANNER_MB}MB`);
            setBannerFiles([]);
            return;
        }
        setUploadingBanner(true);
        const path = await uploadFile(file, "services/banners");
        setUploadingBanner(false);
        if (path) {
            setForm((p) => ({ ...p, bannerImage: path }));
            toast.success("Banner image uploaded");
        } else {
            toast.error("Failed to upload banner image");
            setBannerFiles([]);
        }
    };

    const handlePosterUpload = async (files: File[]) => {
        if (!files.length) return;
        const file = files[0];
        if (file.size > MAX_BANNER_MB * 1024 * 1024) {
            toast.error(`Poster must be under ${MAX_BANNER_MB}MB`);
            setPosterFiles([]);
            return;
        }
        setUploadingPoster(true);
        const path = await uploadFile(file, "services/posters");
        setUploadingPoster(false);
        if (path) {
            setForm((p) => ({ ...p, videoPoster: path }));
            toast.success("Poster uploaded");
        } else {
            toast.error("Failed to upload poster");
            setPosterFiles([]);
        }
    };

    const handleVideoUpload = async (files: File[]) => {
        if (!files.length) return;
        const file = files[0];
        if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
            toast.error(`Video must be under ${MAX_VIDEO_MB}MB`);
            setVideoFiles([]);
            return;
        }
        setUploadingVideo(true);
        setVideoUploadProgress(0);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const url = await new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", (e) => {
                    if (e.lengthComputable)
                        setVideoUploadProgress(Math.round((e.loaded / e.total) * 100));
                });
                xhr.addEventListener("load", () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const r = JSON.parse(xhr.responseText);
                        if (r.success) resolve(r.path);
                        else reject(new Error(r.error || "Upload failed"));
                    } else reject(new Error("Upload failed"));
                });
                xhr.addEventListener("error", () => reject(new Error("Network error")));
                xhr.open("POST", "/api/upload?folder=services/videos");
                xhr.send(fd);
            });
            setForm((p) => ({ ...p, videoUrl: url }));
            toast.success("Video uploaded");
        } catch (err: any) {
            toast.error(err?.message || "Failed to upload video");
            setVideoFiles([]);
        } finally {
            setUploadingVideo(false);
            setVideoUploadProgress(0);
        }
    };

    // ── Comparison pair helpers ────────────────────────────────────────────
    const addComparisonPair = () => {
        setForm((p) => ({
            ...p,
            comparisonImages: [
                ...p.comparisonImages,
                { beforeImage: "", beforeAlt: "", afterImage: "", afterAlt: "", _uploadingBefore: false, _uploadingAfter: false },
            ],
        }));
    };

    const removeComparisonPair = (index: number) => {
        setForm((p) => ({ ...p, comparisonImages: p.comparisonImages.filter((_, i) => i !== index) }));
    };

    const updatePair = (index: number, field: keyof ComparisonPair, value: any) => {
        setForm((p) => {
            const pairs = [...p.comparisonImages];
            pairs[index] = { ...pairs[index], [field]: value };
            return { ...p, comparisonImages: pairs };
        });
    };

    const handleComparisonImageUpload = async (index: number, side: "before" | "after", files: File[]) => {
        if (!files.length) return;
        const file = files[0];
        if (file.size > MAX_COMPARISON_MB * 1024 * 1024) {
            toast.error(`Image must be under ${MAX_COMPARISON_MB}MB`);
            return;
        }
        updatePair(index, side === "before" ? "_uploadingBefore" : "_uploadingAfter", true);
        const path = await uploadFile(file, "services/comparisons");
        updatePair(index, side === "before" ? "_uploadingBefore" : "_uploadingAfter", false);
        if (path) {
            updatePair(index, side === "before" ? "beforeImage" : "afterImage", path);
            toast.success(`${side === "before" ? "Before" : "After"} image uploaded`);
        } else {
            toast.error(`Failed to upload ${side} image`);
        }
    };

    // ── Completion / validation ────────────────────────────────────────────
    const completion = useMemo(() => [
        { label: "Title", ok: !!form.title.trim() },
        { label: "URL Slug", ok: !!form.url.trim() && urlAvailable === true },
        { label: "Content", ok: !!form.content.trim() },
        { label: "Banner Image", ok: !!form.bannerImage },
        {
            label: form.mediaType === "video" ? "Video" : "Comparison Images",
            ok: form.mediaType === "video"
                ? !!form.videoUrl
                : form.comparisonImages.length > 0 && form.comparisonImages.every((p) => p.beforeImage && p.afterImage),
        },
    ], [form, urlAvailable]);

    const completionPct = Math.round((completion.filter((c) => c.ok).length / completion.length) * 100);
    const isValid = completion.every((c) => c.ok);

    // ── Save ───────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!isValid) { toast.warning("Please fill in all required fields"); return; }
        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                url: form.url.trim(),
                breadcrumb: form.breadcrumb.trim() || form.title.trim(),
                description: form.description.trim() || undefined,
                content: form.content.trim(),
                bannerImage: form.bannerImage,
                bannerImageAlt: form.bannerImageAlt.trim() || undefined,
                mediaType: form.mediaType,
                videoUrl: form.mediaType === "video" ? form.videoUrl || undefined : undefined,
                videoPoster: form.mediaType === "video" ? form.videoPoster || undefined : undefined,
                comparisonImages: form.mediaType === "image"
                    ? form.comparisonImages.map((p) => ({
                          ...(p.id ? { id: p.id } : {}),
                          beforeImage: p.beforeImage,
                          beforeAlt: p.beforeAlt || undefined,
                          afterImage: p.afterImage,
                          afterAlt: p.afterAlt || undefined,
                      }))
                    : [],
            };

            const url = isEdit ? `/api/services/${form.id}` : "/api/services";
            const method = isEdit ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (result.success) {
                toast.success(isEdit ? "Service updated successfully" : "Service created successfully");
                setTimeout(() => {
                    router.push("/dashboard/services");
                    router.refresh();
                }, 800);
            } else {
                toast.error(result.error || "Failed to save service");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 130, behavior: "smooth" });
        setActiveSection(id);
    };

    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50/60">
            {/* ── Sticky top bar ── */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-0 border-t border-slate-100">
                    {/* Section nav tabs */}
                    <div className="flex">
                        {NAV.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => scrollTo(s.id)}
                                className={`px-3 py-2 text-[11px] font-medium border-b-2 transition-colors ${
                                    activeSection === s.id
                                        ? "border-slate-900 text-slate-900"
                                        : "border-transparent text-slate-400 hover:text-slate-700"
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/dashboard/services")}
                            disabled={saving}
                            className="h-7 text-xs text-slate-500 hover:text-slate-900 hidden sm:inline-flex"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSave}
                            disabled={saving || !isValid}
                            className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                        >
                            {saving
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                : <Eye className="h-3.5 w-3.5 mr-1.5" />
                            }
                            {isEdit ? "Save Changes" : "Create Service"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col xl:flex-row gap-5">
                <div className="flex-1 min-w-0 space-y-5">

                    {/* ── SECTION 1: Basic Info ── */}
                    <section id="basic" className="scroll-mt-32 bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Basic Information" />
                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <FieldLabel required ok={!!form.title.trim()}>
                                    Service Title
                                </FieldLabel>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Technical Delivery & AV"
                                    className={inp}
                                />
                            </div>

                            {/* URL Slug */}
                            <div>
                                <FieldLabel required ok={urlAvailable === true}>
                                    URL Slug
                                </FieldLabel>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 select-none">
                                        /services/
                                    </div>
                                    <Input
                                        value={form.url}
                                        onChange={(e) => {
                                            setUrlManuallyEdited(true);
                                            setForm((p) => ({ ...p, url: slugify(e.target.value) }));
                                        }}
                                        placeholder="technical-delivery-av"
                                        className={`${inp} pl-[78px]`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {checkingUrl && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                                        {!checkingUrl && urlAvailable === true && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                                        {!checkingUrl && urlAvailable === false && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
                                    </div>
                                </div>
                                {urlAvailable === false && (
                                    <p className="mt-1 text-[11px] text-red-400">This URL is already taken</p>
                                )}
                            </div>

                            {/* Breadcrumb */}
                            <div>
                                <FieldLabel ok={!!form.breadcrumb.trim()}>
                                    Breadcrumb Label
                                    <span className="ml-1 text-slate-300 font-normal">(auto-filled from title)</span>
                                </FieldLabel>
                                <Input
                                    value={form.breadcrumb}
                                    onChange={(e) => setForm((p) => ({ ...p, breadcrumb: e.target.value }))}
                                    placeholder="e.g. Technical Delivery & AV"
                                    className={inp}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <FieldLabel ok={!!form.description.trim()}>
                                    Short Description
                                    <span className="ml-1 text-slate-300 font-normal">(optional)</span>
                                </FieldLabel>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                    placeholder="Brief description shown on the service card…"
                                    rows={3}
                                    className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ── SECTION 2: Banner Image ── */}
                    <section id="banner" className="scroll-mt-32 bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Banner Image" />
                        <p className="text-[11px] text-slate-400 mb-3">
                            Required · Max <span className="font-medium text-slate-600">{MAX_BANNER_MB}MB</span> · JPG, PNG, WebP
                        </p>

                        <ImageUploader
                            files={bannerFiles}
                            onChange={(f) => { setBannerFiles(f); handleBannerUpload(f); }}
                            maxFiles={1}
                            maxSize={MAX_BANNER_MB}
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                        />

                        {uploadingBanner && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading banner…
                            </div>
                        )}

                        {form.bannerImage && !uploadingBanner && (
                            <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100">
                                <div className="relative w-full h-48">
                                    <Image src={form.bannerImage} alt={form.bannerImageAlt || "Banner"} fill className="object-cover" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setForm((p) => ({ ...p, bannerImage: "" })); setBannerFiles([]); }}
                                    className="absolute top-2 right-2 p-1 rounded-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}

                        <div className="mt-4">
                            <FieldLabel ok={!!form.bannerImageAlt.trim()}>
                                Banner Alt Text
                                <span className="ml-1 text-slate-300 font-normal">(optional)</span>
                            </FieldLabel>
                            <Input
                                value={form.bannerImageAlt}
                                onChange={(e) => setForm((p) => ({ ...p, bannerImageAlt: e.target.value }))}
                                placeholder="e.g. Technical delivery setup at event venue"
                                className={inp}
                            />
                        </div>
                    </section>

                    {/* ── SECTION 3: Content ── */}
                    <section id="content" className="scroll-mt-32 bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Page Content" />
                        <TiptapEditor
                            content={editorContent}
                            onChange={(c) => {
                                setEditorContent(c);
                                setForm((p) => ({ ...p, content: c }));
                            }}
                            placeholder="Write the full service page content…"
                        />
                    </section>

                    {/* ── SECTION 4: Media ── */}
                    <section id="media" className="scroll-mt-32 bg-white border border-slate-200 rounded-xl overflow-hidden">
                        {/* Accordion header */}
                        <button
                            type="button"
                            onClick={() => setShowMediaSection((v) => !v)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
                        >
                            <div>
                                <p className="text-xs font-semibold text-slate-700">Media Content</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Choose between a video or before/after image comparison
                                </p>
                            </div>
                            {showMediaSection
                                ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                                : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                            }
                        </button>

                        {showMediaSection && (
                            <div className="border-t border-slate-100 p-5 space-y-5">
                                {/* Toggle */}
                                <div>
                                    <p className="text-xs font-medium text-slate-600 mb-2">Media Type</p>
                                    <div className="flex gap-2 max-w-xs">
                                        <button
                                            type="button"
                                            onClick={() => setForm((p) => ({ ...p, mediaType: "video" }))}
                                            className={`flex-1 h-10 text-sm rounded-md border transition-colors flex items-center justify-center gap-1.5 ${
                                                form.mediaType === "video"
                                                    ? "bg-slate-900 text-white border-slate-900"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                            }`}
                                        >
                                            <Video className="h-3.5 w-3.5" /> Video
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm((p) => ({ ...p, mediaType: "image" }))}
                                            className={`flex-1 h-10 text-sm rounded-md border transition-colors flex items-center justify-center gap-1.5 ${
                                                form.mediaType === "image"
                                                    ? "bg-slate-900 text-white border-slate-900"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                            }`}
                                        >
                                            <Images className="h-3.5 w-3.5" /> Image Comparison
                                        </button>
                                    </div>
                                </div>

                                {/* ── VIDEO ── */}
                                {form.mediaType === "video" && (
                                    <div className="space-y-4 border-t border-slate-100 pt-4">
                                        <SectionHeading label={`Video · max ${MAX_VIDEO_MB}MB · mp4 / webm`} />
                                        <ImageUploader
                                            files={videoFiles}
                                            onChange={(f) => { setVideoFiles(f); handleVideoUpload(f); }}
                                            maxFiles={1}
                                            maxSize={MAX_VIDEO_MB}
                                            accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                        />

                                        {uploadingVideo && (
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs text-slate-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading video…
                                                    </span>
                                                    <span>{videoUploadProgress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all"
                                                        style={{ width: `${videoUploadProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[11px] text-slate-400">Please don't close the tab.</p>
                                            </div>
                                        )}

                                        {form.videoUrl && !uploadingVideo && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-slate-600">Preview</p>
                                                <div className="rounded-lg overflow-hidden border border-slate-200 bg-black">
                                                    <video
                                                        src={form.videoUrl}
                                                        poster={form.videoPoster || undefined}
                                                        className="w-full max-h-64 object-contain"
                                                        controls muted playsInline
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => { setForm((p) => ({ ...p, videoUrl: "" })); setVideoFiles([]); }}
                                                    className="text-xs text-red-500 hover:text-red-700"
                                                >
                                                    Remove video
                                                </button>
                                            </div>
                                        )}

                                        {/* Poster */}
                                        <div className="border-t border-slate-100 pt-4">
                                            <SectionHeading label={`Video Poster / Thumbnail · optional · max ${MAX_BANNER_MB}MB`} />
                                            <ImageUploader
                                                files={posterFiles}
                                                onChange={(f) => { setPosterFiles(f); handlePosterUpload(f); }}
                                                maxFiles={1}
                                                maxSize={MAX_BANNER_MB}
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                            />
                                            {uploadingPoster && (
                                                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading poster…
                                                </div>
                                            )}
                                            {form.videoPoster && !uploadingPoster && (
                                                <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100">
                                                    <div className="relative w-full h-36">
                                                        <Image src={form.videoPoster} alt="Video poster" fill className="object-cover" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setForm((p) => ({ ...p, videoPoster: "" })); setPosterFiles([]); }}
                                                        className="absolute top-2 right-2 p-1 rounded-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── IMAGE COMPARISON ── */}
                                {form.mediaType === "image" && (
                                    <div className="space-y-4 border-t border-slate-100 pt-4">
                                        <div className="flex items-center justify-between">
                                            <SectionHeading label={`Before / After Pairs (${form.comparisonImages.length})`} />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={addComparisonPair}
                                                className="h-7 text-xs gap-1.5 shrink-0 mb-4"
                                            >
                                                <Plus className="h-3.5 w-3.5" /> Add Pair
                                            </Button>
                                        </div>

                                        {form.comparisonImages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                                                <Images className="h-8 w-8 text-slate-300 mb-2" />
                                                <p className="text-sm text-slate-400 mb-3">No comparison pairs yet</p>
                                                <Button type="button" size="sm" variant="outline" onClick={addComparisonPair} className="h-7 text-xs gap-1.5">
                                                    <Plus className="h-3.5 w-3.5" /> Add First Pair
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-5">
                                                {form.comparisonImages.map((pair, index) => (
                                                    <ComparisonPairEditor
                                                        key={index}
                                                        pair={pair}
                                                        index={index}
                                                        onRemove={() => removeComparisonPair(index)}
                                                        onUpdate={(field, value) => updatePair(index, field, value)}
                                                        onUploadImage={(side, files) => handleComparisonImageUpload(index, side, files)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Mobile action footer */}
                    <div className="flex sm:hidden gap-2 pb-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/dashboard/services")}
                            disabled={saving}
                            className="flex-1 h-9 text-xs"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSave}
                            disabled={saving || !isValid}
                            className="flex-1 h-9 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                        >
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                            {isEdit ? "Save Changes" : "Create Service"}
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
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                                    style={{ width: `${completionPct}%` }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                {completion.map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        {item.ok
                                            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                            : <AlertCircle className="h-3.5 w-3.5 text-slate-200 shrink-0" />
                                        }
                                        <span className={`text-[11px] ${item.ok ? "text-slate-600" : "text-slate-400"}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <span className="text-xs font-medium text-slate-600 block mb-3">Tips</span>
                            <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                                <li>URL slug is auto-generated from title.</li>
                                <li>Banner image is required and shown at top of the service page.</li>
                                <li>Choose <strong className="text-slate-500">Video</strong> or <strong className="text-slate-500">Image Comparison</strong> — not both.</li>
                                <li>Before/after pairs use a drag slider on the frontend.</li>
                                <li>Video poster shows before the video plays.</li>
                                <li>Max image size: <strong className="text-slate-500">{MAX_BANNER_MB}MB</strong> · Max video: <strong className="text-slate-500">{MAX_VIDEO_MB}MB</strong>.</li>
                            </ul>
                        </div>

                        {/* Media type indicator */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <span className="text-xs font-medium text-slate-600 block mb-2">Current Media Type</span>
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                                form.mediaType === "video"
                                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}>
                                {form.mediaType === "video"
                                    ? <><Video className="h-3.5 w-3.5" /> Video</>
                                    : <><Images className="h-3.5 w-3.5" /> Image Comparison ({form.comparisonImages.length} pairs)</>
                                }
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

// ─── Comparison Pair Editor ───────────────────────────────────────────────────

// ─── Comparison Pair Editor ───────────────────────────────────────────────────

function ComparisonPairEditor({
    pair, index, onRemove, onUpdate, onUploadImage,
}: {
    pair: ComparisonPair;
    index: number;
    onRemove: () => void;
    onUpdate: (field: keyof ComparisonPair, value: any) => void;
    onUploadImage: (side: "before" | "after", files: File[]) => void;
}) {
    const [beforeFiles, setBeforeFiles] = useState<File[]>([]);
    const [afterFiles, setAfterFiles] = useState<File[]>([]);

    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

    return (
        <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/50">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Pair {index + 1}
                </span>
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* ── Step 1: Before image ── */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full bg-slate-200 text-[9px] flex items-center justify-center font-bold text-slate-500">B</span>
                    Before Image <span className="text-red-400">*</span>
                </p>
                <ImageUploader
                    files={beforeFiles}
                    onChange={(f) => { setBeforeFiles(f); onUploadImage("before", f); }}
                    maxFiles={1} maxSize={5}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                />
                {pair._uploadingBefore && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                    </div>
                )}
                {pair.beforeImage && !pair._uploadingBefore && (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-100">
                        <div className="relative w-full h-40">
                            <Image src={pair.beforeImage} alt={pair.beforeAlt || "Before"} fill className="object-cover" />
                        </div>
                        <button
                            type="button"
                            onClick={() => { onUpdate("beforeImage", ""); setBeforeFiles([]); }}
                            className="absolute top-1 right-1 p-1 rounded bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}
                <Input
                    value={pair.beforeAlt}
                    onChange={(e) => onUpdate("beforeAlt", e.target.value)}
                    placeholder="Before image alt text (optional)"
                    className={inp}
                />
            </div>

            {/* ── Step 2: After image — only revealed once Before is uploaded ── */}
            {pair.beforeImage ? (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-full bg-primary/10 text-[9px] flex items-center justify-center font-bold text-primary">A</span>
                        After Image <span className="text-red-400">*</span>
                    </p>
                    <ImageUploader
                        files={afterFiles}
                        onChange={(f) => { setAfterFiles(f); onUploadImage("after", f); }}
                        maxFiles={1} maxSize={5}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                    />
                    {pair._uploadingAfter && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                        </div>
                    )}
                    {pair.afterImage && !pair._uploadingAfter && (
                        <div className="relative group rounded-lg overflow-hidden border border-slate-100">
                            <div className="relative w-full h-40">
                                <Image src={pair.afterImage} alt={pair.afterAlt || "After"} fill className="object-cover" />
                            </div>
                            <button
                                type="button"
                                onClick={() => { onUpdate("afterImage", ""); setAfterFiles([]); }}
                                className="absolute top-1 right-1 p-1 rounded bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    <Input
                        value={pair.afterAlt}
                        onChange={(e) => onUpdate("afterAlt", e.target.value)}
                        placeholder="After image alt text (optional)"
                        className={inp}
                    />
                </div>
            ) : (
                <div className="border-t border-slate-200 pt-4">
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3 text-slate-300" />
                        Upload the Before image first to unlock the After image step.
                    </p>
                </div>
            )}
        </div>
    );
}