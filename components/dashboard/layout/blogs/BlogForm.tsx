// components/dashboard/layout/blogs/BlogForm.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToasts } from "@/components/ui/toast";
import { ArrowLeft, Save, Loader2, X, Image as ImageIcon, FileText, AlertCircle, CheckCircle2, Eye, Tag, Search, Link2, Code2, Hash, ChevronRight } from "lucide-react";
import Link from "next/link";
import TiptapEditor from "@/components/Editor/TiptapEditor";
import TableOfContents, { HeadingItem } from "@/components/Editor/TableOfContents";

enum BlogStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}

interface BlogCategory {
    id: number;
    name: string;
    description: string | null;
}
interface Author {
    id: number;
    name: string;
    email: string;
}

interface BlogFormProps {
    initialData?: {
        id: number;
        title: string;
        slug: string;
        description: string;
        content: string;
        status: BlogStatus;
        publishedAt: Date | null;
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
        thumbnail: string;
        banner_image: string;
        canonical: string;
        schemaScript: string;
        timeToRead: string | null;
        authorId: number;
        categoryId: number;
    };
    blogId?: number;
    mode: "create" | "edit";
}

const NAV = [
    { id: "basic", label: "Basic Info" },
    { id: "content", label: "Content" },
    { id: "media", label: "Media" },
    { id: "seo", label: "SEO" },
] as const;

// ── tiny helpers ──────────────────────────────────────────
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

export default function BlogForm({ initialData, blogId, mode }: BlogFormProps) {
    const router = useRouter();
    const toast = useToasts();

    const [loading, setLoading] = useState(false);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingAuthors, setLoadingAuthors] = useState(true);
    const [headings, setHeadings] = useState<HeadingItem[]>([]);
    const [activeSection, setActiveSection] = useState("basic");
    const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
    const [bannerFiles, setBannerFiles] = useState<File[]>([]);
    const [editorContent, setEditorContent] = useState("");
    const [keywordInput, setKeywordInput] = useState("");

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        description: initialData?.description || "",
        content: initialData?.content || "",
        status: initialData?.status || BlogStatus.DRAFT,
        metaTitle: initialData?.metaTitle || "",
        metaDescription: initialData?.metaDescription || "",
        keywords: initialData?.keywords || [],
        thumbnail: initialData?.thumbnail || "",
        banner_image: initialData?.banner_image || "",
        canonical: initialData?.canonical || "",
        schemaScript: initialData?.schemaScript || "",
        timeToRead: initialData?.timeToRead || "",
        authorId: initialData?.authorId || 0,
        categoryId: initialData?.categoryId || 0,
    });

    const completion = useMemo(
        () => [
            { label: "Title", ok: !!formData.title.trim() },
            { label: "Slug", ok: !!formData.slug.trim() },
            { label: "Description", ok: !!formData.description.trim() },
            { label: "Content", ok: !!formData.content.trim() },
            { label: "Thumbnail", ok: !!formData.thumbnail },
            { label: "Banner", ok: !!formData.banner_image },
            { label: "Category", ok: formData.categoryId !== 0 },
            { label: "Author", ok: formData.authorId !== 0 },
        ],
        [formData],
    );

    const completionPct = Math.round((completion.filter((c) => c.ok).length / completion.length) * 100);
    const isFormValid = completion.every((c) => c.ok);

    // ── fetch categories + authors ────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const [cRes, aRes] = await Promise.all([fetch("/api/blog-categories"), fetch("/api/authors")]);
                const [cData, aData] = await Promise.all([cRes.json(), aRes.json()]);
                if (cData.success) setCategories(cData.data);
                if (aData.success) setAuthors(aData.data);
            } catch {
                toast.error("Failed to load categories or authors");
            } finally {
                setLoadingCategories(false);
                setLoadingAuthors(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── edit mode: load blog ──────────────────────────────
    useEffect(() => {
        if (mode !== "edit" || !blogId) return;
        fetch(`/api/blogs/${blogId}`)
            .then((r) => r.json())
            .then((data) => {
                if (!data.success) return toast.error("Failed to load blog data");
                const b = data.data;
                setFormData({
                    title: b.title,
                    slug: b.slug,
                    description: b.description,
                    content: b.content,
                    status: b.status,
                    metaTitle: b.metaTitle,
                    metaDescription: b.metaDescription,
                    keywords: b.keywords || [],
                    thumbnail: b.thumbnail,
                    banner_image: b.banner_image,
                    canonical: b.canonical,
                    schemaScript: b.schemaScript,
                    timeToRead: b.timeToRead || "",
                    authorId: b.authorId,
                    categoryId: b.categoryId,
                });
                setEditorContent(b.content);
            })
            .catch(() => toast.error("Failed to load blog data"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, blogId]);

    // ── auto slug ─────────────────────────────────────────
    useEffect(() => {
        if (mode !== "create" || !formData.title) return;
        setFormData((p) => ({
            ...p,
            slug: p.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.title]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: name === "categoryId" || name === "authorId" ? parseInt(value) : value }));
    };

    // ── image upload helper ───────────────────────────────
    const uploadImage = async (file: File): Promise<string | null> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const result = await res.json();
        return result.success ? result.path : null;
    };

    const handleThumbnailUpload = async (files: File[]) => {
        if (!files.length) return;
        setUploadingThumbnail(true);
        const path = await uploadImage(files[0]).catch(() => null);
        setUploadingThumbnail(false);
        if (path) {
            setFormData((p) => ({ ...p, thumbnail: path }));
            toast.success("Thumbnail uploaded");
        } else toast.error("Failed to upload thumbnail");
    };

    const handleBannerUpload = async (files: File[]) => {
        if (!files.length) return;
        setUploadingBanner(true);
        const path = await uploadImage(files[0]).catch(() => null);
        setUploadingBanner(false);
        if (path) {
            setFormData((p) => ({ ...p, banner_image: path }));
            toast.success("Banner uploaded");
        } else toast.error("Failed to upload banner");
    };

    const handleAddKeyword = () => {
        const kw = keywordInput.trim();
        if (kw && !formData.keywords.includes(kw)) {
            setFormData((p) => ({ ...p, keywords: [...p.keywords, kw] }));
            setKeywordInput("");
        }
    };

    // ── submit ────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent, statusOverride?: BlogStatus) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.warning("Please complete all required fields");
            return;
        }
        setLoading(true);
        try {
            const finalStatus = statusOverride ?? formData.status;
            const res = await fetch(mode === "create" ? "/api/blogs" : `/api/blogs/${blogId}`, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    status: finalStatus,
                    metaTitle: formData.metaTitle || formData.title,
                    metaDescription: formData.metaDescription || formData.description,
                    canonical: formData.canonical || `https://yoursite.com/blogs/${formData.slug}`,
                }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success(mode === "create" ? `Blog ${finalStatus === BlogStatus.PUBLISHED ? "published" : "saved as draft"}!` : "Blog updated successfully!");
                setTimeout(() => {
                    router.push("/dashboard/blogs");
                    router.refresh();
                }, 800);
            } else toast.error(result.error || "Failed to save blog");
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 130, behavior: "smooth" });
        setActiveSection(id);
    };

    // ── common input class ────────────────────────────────
    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";
    const sel = "w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-400 text-slate-700 disabled:opacity-50";

    return (
        <div className="min-h-screen bg-slate-50/60">
            {/* ── sticky topbar ─────────────────────────── */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-3">
                    {/* back */}
                    <Button variant="ghost" size="icon" asChild className="h-7 w-7 text-slate-500 hover:text-slate-900">
                        <Link href="/dashboard/blogs">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>

                    <div className="h-4 w-px bg-slate-200" />

                    {/* breadcrumb */}
                    <span className="text-xs text-slate-400">Blogs</span>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{mode === "create" ? "New post" : formData.title || "Edit post"}</span>

                    {/* progress pill */}
                    <div className="hidden md:flex items-center gap-2 ml-3">
                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${completionPct}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-400">{completionPct}%</span>
                    </div>

                    {/* spacer */}
                    <div className="flex-1" />

                    {/* actions */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleSubmit(e, BlogStatus.DRAFT)}
                        disabled={loading || !isFormValid}
                        className="h-7 text-xs text-slate-600 hover:text-slate-900 hidden sm:inline-flex"
                    >
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        Save draft
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={(e) => handleSubmit(e, BlogStatus.PUBLISHED)}
                        disabled={loading || uploadingThumbnail || uploadingBanner || !isFormValid}
                        className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                    >
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                        {mode === "create" ? "Publish" : "Update"}
                    </Button>
                </div>

                {/* section tabs */}
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center gap-0 border-t border-slate-100">
                    {NAV.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => scrollTo(s.id)}
                            className={`px-3 py-2 text-[11px] font-medium border-b-2 transition-colors ${
                                activeSection === s.id ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700"
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── body ──────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col xl:flex-row gap-5">
                {/* ── left / main ───────────────────────── */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* BASIC INFO */}
                    <section id="basic" className="scroll-mt-32 bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Basic Info" />

                        <div className="space-y-4">
                            {/* title */}
                            <div>
                                <FieldLabel required ok={!!formData.title}>
                                    Title
                                </FieldLabel>
                                <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 10 Tips for Successful Event Planning" className={inp} maxLength={100} />
                                <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.title.length}/100</p>
                            </div>

                            {/* slug */}
                            <div>
                                <FieldLabel required ok={!!formData.slug}>
                                    URL Slug
                                </FieldLabel>
                                <div className="flex">
                                    <span className="flex items-center px-2.5 text-[11px] text-slate-400 border border-r-0 border-slate-200 rounded-l-md bg-slate-50 whitespace-nowrap">/blogs/</span>
                                    <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="your-slug" className={`${inp} rounded-l-none`} maxLength={100} />
                                </div>
                            </div>

                            {/* description */}
                            <div>
                                <FieldLabel required ok={!!formData.description}>
                                    Description
                                </FieldLabel>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description shown in listings and meta…"
                                    rows={3}
                                    className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                                    maxLength={160}
                                />
                                <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.description.length}/160</p>
                            </div>

                            {/* category / author / read time */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <FieldLabel required ok={formData.categoryId !== 0}>
                                        Category
                                    </FieldLabel>
                                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} className={sel} disabled={loadingCategories}>
                                        <option value={0}>Select…</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <FieldLabel required ok={formData.authorId !== 0}>
                                        Author
                                    </FieldLabel>
                                    <select name="authorId" value={formData.authorId} onChange={handleChange} className={sel} disabled={loadingAuthors}>
                                        <option value={0}>Select…</option>
                                        {authors.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <FieldLabel>Reading time</FieldLabel>
                                    <Input name="timeToRead" value={formData.timeToRead} onChange={handleChange} placeholder="5 min read" className={inp} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CONTENT */}
                    <section id="content" className="scroll-mt-32 bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Content" />
                        <TiptapEditor
                            content={editorContent}
                            onChange={(c) => {
                                setEditorContent(c);
                                setFormData((p) => ({ ...p, content: c }));
                            }}
                            onHeadingsChange={setHeadings}
                        />
                    </section>

                    {/* MEDIA */}
                    <section id="media" className="scroll-mt-32">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* thumbnail */}
                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                <SectionHeading label="Thumbnail" />
                                <ImageUploader
                                    files={thumbnailFiles}
                                    onChange={(f) => {
                                        setThumbnailFiles(f);
                                        handleThumbnailUpload(f);
                                    }}
                                    maxFiles={1}
                                    maxSize={4}
                                    accept="image/*"
                                />
                                {uploadingThumbnail && (
                                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                                    </div>
                                )}
                                {formData.thumbnail && !uploadingThumbnail && (
                                    <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100">
                                        <img src={formData.thumbnail} alt="" className="w-full h-28 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData((p) => ({ ...p, thumbnail: "" }));
                                                setThumbnailFiles([]);
                                            }}
                                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 shadow text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* banner */}
                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                <SectionHeading label="Banner Image" />
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
                                {uploadingBanner && (
                                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                                    </div>
                                )}
                                {formData.banner_image && !uploadingBanner && (
                                    <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100">
                                        <img src={formData.banner_image} alt="" className="w-full h-28 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData((p) => ({ ...p, banner_image: "" }));
                                                setBannerFiles([]);
                                            }}
                                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 shadow text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* SEO */}
                    <section id="seo" className="scroll-mt-32 bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="SEO" />

                        <div className="space-y-4">
                            {/* meta title */}
                            <div>
                                <FieldLabel>Meta title</FieldLabel>
                                <Input
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                    placeholder={formData.title || "Leave blank to inherit blog title"}
                                    className={inp}
                                    maxLength={60}
                                />
                                <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.metaTitle.length}/60</p>
                            </div>

                            {/* meta description */}
                            <div>
                                <FieldLabel>Meta description</FieldLabel>
                                <Textarea
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleChange}
                                    placeholder={formData.description || "Leave blank to inherit blog description"}
                                    rows={2}
                                    className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                                    maxLength={160}
                                />
                                <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.metaDescription.length}/160</p>
                            </div>

                            {/* keywords */}
                            <div>
                                <FieldLabel>Keywords</FieldLabel>
                                <div className="flex gap-2">
                                    <Input
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddKeyword();
                                            }
                                        }}
                                        placeholder="Add a keyword and press Enter"
                                        className={inp}
                                    />
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddKeyword} className="h-9 text-xs shrink-0">
                                        Add
                                    </Button>
                                </div>
                                {formData.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {formData.keywords.map((kw, i) => (
                                            <span key={`${kw}-${i}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded-full">
                                                {kw}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData((p) => ({ ...p, keywords: p.keywords.filter((k) => k !== kw) }))}
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    <X className="h-2.5 w-2.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* canonical */}
                            <div>
                                <FieldLabel>Canonical URL</FieldLabel>
                                <Input
                                    name="canonical"
                                    value={formData.canonical}
                                    onChange={handleChange}
                                    placeholder={`https://yoursite.com/blogs/${formData.slug || "your-slug"}`}
                                    className={`${inp} font-mono text-[12px]`}
                                />
                            </div>

                            {/* schema */}
                            <div>
                                <FieldLabel>Schema markup (JSON-LD)</FieldLabel>
                                <Textarea
                                    name="schemaScript"
                                    value={formData.schemaScript}
                                    onChange={handleChange}
                                    placeholder={'{"@context":"https://schema.org",...}'}
                                    rows={5}
                                    className="text-[11px] font-mono border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    </section>

                    {/* mobile action footer */}
                    <div className="flex sm:hidden gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={(e) => handleSubmit(e, BlogStatus.DRAFT)} disabled={loading || !isFormValid} className="flex-1 h-9 text-xs">
                            <Save className="h-3.5 w-3.5 mr-1.5" /> Save draft
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={(e) => handleSubmit(e, BlogStatus.PUBLISHED)}
                            disabled={loading || uploadingThumbnail || uploadingBanner || !isFormValid}
                            className="flex-1 h-9 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                        >
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                            {mode === "create" ? "Publish" : "Update"}
                        </Button>
                    </div>
                </div>

                {/* ── right / sidebar ───────────────────── */}
                <aside className="w-full xl:w-64 shrink-0">
                    <div className="xl:sticky xl:top-[108px] space-y-4">
                        {/* completion */}
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

                        {/* table of contents */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <span className="text-xs font-medium text-slate-600 block mb-3">Table of Contents</span>
                            <div className="max-h-60 overflow-y-auto">
                                <TableOfContents headings={headings} />
                            </div>
                        </div>

                        {/* tips */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <span className="text-xs font-medium text-slate-600 block mb-3">Tips</span>
                            <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                                <li>Keep title under 60 chars for SEO.</li>
                                <li>Use 2–5 targeted keywords.</li>
                                <li>Banner: 1200×630 ideal for social.</li>
                                <li>H2/H3 headings auto-build the TOC.</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </form>
        </div>
    );
}

export function DashboardHeader({ title, description }: { title: string; description?: string }) {
    return (
        <>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
        </>
    );
}
