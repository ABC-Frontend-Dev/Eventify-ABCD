// components/dashboard/layout/blogs/BlogForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToasts } from "@/components/ui/toast";
import { ArrowLeft, Save, Loader2, X, Image as ImageIcon, FileText, AlertCircle, CheckCircle2, Eye, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "../common/Header";
import { Separator } from "@/components/ui/separator";
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

    // Fetch categories and authors
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, authorsRes] = await Promise.all([fetch("/api/blog-categories"), fetch("/api/authors")]);

                const categoriesData = await categoriesRes.json();
                const authorsData = await authorsRes.json();

                if (categoriesData.success) {
                    setCategories(categoriesData.data);
                }

                if (authorsData.success) {
                    setAuthors(authorsData.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load categories or authors");
            } finally {
                setLoadingCategories(false);
                setLoadingAuthors(false);
            }
        };

        fetchData();
    }, []);

    // For Edit mode - fetch latest data
    useEffect(() => {
        if (mode === "edit" && blogId) {
            fetch(`/api/blogs/${blogId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.data) {
                        const blog = data.data;
                        setFormData({
                            title: blog.title,
                            slug: blog.slug,
                            description: blog.description,
                            content: blog.content,
                            status: blog.status,
                            metaTitle: blog.metaTitle,
                            metaDescription: blog.metaDescription,
                            keywords: blog.keywords || [],
                            thumbnail: blog.thumbnail,
                            banner_image: blog.banner_image,
                            canonical: blog.canonical,
                            schemaScript: blog.schemaScript,
                            timeToRead: blog.timeToRead || "",
                            authorId: blog.authorId,
                            categoryId: blog.categoryId,
                        });
                        setEditorContent(blog.content);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Failed to load blog data");
                });
        }
    }, [mode, blogId]);

    // Auto-generate slug from title
    useEffect(() => {
        if (mode === "create" && formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setFormData((prev) => ({ ...prev, slug }));
        }
    }, [formData.title, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "categoryId" || name === "authorId" ? parseInt(value) : value,
        }));
    };

    // Handle thumbnail upload
    const handleThumbnailUpload = async (uploadedFiles: File[]) => {
        if (uploadedFiles.length === 0) return;

        setUploadingThumbnail(true);
        const file = uploadedFiles[0];

        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });

            const result = await response.json();

            if (result.success) {
                setFormData((prev) => ({
                    ...prev,
                    thumbnail: result.path,
                }));
                toast.success("Thumbnail uploaded successfully!");
            } else {
                toast.error(result.error || "Failed to upload thumbnail");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload thumbnail");
        } finally {
            setUploadingThumbnail(false);
        }
    };

    // Handle banner upload
    const handleBannerUpload = async (uploadedFiles: File[]) => {
        if (uploadedFiles.length === 0) return;

        setUploadingBanner(true);
        const file = uploadedFiles[0];

        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });

            const result = await response.json();

            if (result.success) {
                setFormData((prev) => ({
                    ...prev,
                    banner_image: result.path,
                }));
                toast.success("Banner uploaded successfully!");
            } else {
                toast.error(result.error || "Failed to upload banner");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload banner");
        } finally {
            setUploadingBanner(false);
        }
    };

    // Handle keyword addition
    const handleAddKeyword = () => {
        if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                keywords: [...prev.keywords, keywordInput.trim()],
            }));
            setKeywordInput("");
        }
    };

    // Handle keyword removal
    const handleRemoveKeyword = (keyword: string) => {
        setFormData((prev) => ({
            ...prev,
            keywords: prev.keywords.filter((k) => k !== keyword),
        }));
    };

    // Handle editor content change
    const handleEditorChange = (content: string) => {
        setEditorContent(content);
        setFormData((prev) => ({ ...prev, content }));
    };

    const handleHeadingsChange = (newHeadings: HeadingItem[]) => {
        setHeadings(newHeadings);
    };

    // ✅ FIX: Handle save as draft
    const handleSaveAsDraft = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmit(e, BlogStatus.DRAFT);
    };

    // ✅ FIX: Handle publish
    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmit(e, BlogStatus.PUBLISHED);
    };

    // ✅ UPDATED: Main submit function with status parameter
    const handleSubmit = async (e: React.FormEvent, statusOverride?: BlogStatus) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.warning("Please enter a blog title");
            return;
        }

        if (!formData.slug.trim()) {
            toast.warning("Please enter a slug");
            return;
        }

        if (!formData.description.trim()) {
            toast.warning("Please enter a description");
            return;
        }

        if (!formData.content.trim()) {
            toast.warning("Please write blog content");
            return;
        }

        if (!formData.thumbnail) {
            toast.warning("Please upload a thumbnail");
            return;
        }

        if (!formData.banner_image) {
            toast.warning("Please upload a banner image");
            return;
        }

        if (!formData.authorId || formData.authorId === 0) {
            toast.warning("Please select an author");
            return;
        }

        if (!formData.categoryId || formData.categoryId === 0) {
            toast.warning("Please select a category");
            return;
        }

        setLoading(true);

        try {
            const url = mode === "create" ? "/api/blogs" : `/api/blogs/${blogId}`;

            // ✅ Use the status override if provided, otherwise use form status
            const finalStatus = statusOverride || formData.status;

            const response = await fetch(url, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    status: finalStatus, // ✅ Set the correct status
                    metaTitle: formData.metaTitle || formData.title,
                    metaDescription: formData.metaDescription || formData.description,
                    canonical: formData.canonical || `https://yoursite.com/blogs/${formData.slug}`,
                }),
            });

            const result = await response.json();

            if (result.success) {
                const actionText = finalStatus === BlogStatus.PUBLISHED ? "published" : "saved as draft";
                toast.success(mode === "create" ? `Blog ${actionText} successfully!` : `Blog updated successfully!`);

                setTimeout(() => {
                    router.push("/dashboard/blogs");
                    router.refresh();
                }, 1000);
            } else {
                toast.error(result.error || "Failed to save blog");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid =
        formData.title && formData.slug && formData.description && formData.content && formData.thumbnail && formData.banner_image && formData.authorId !== 0 && formData.categoryId !== 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex items-center justify-between gap-5 mb-8">
                    <div className="flex items-start justify-center gap-4">
                        <Button variant="outline" size="icon" asChild className="mt-1 shrink-0 hover:bg-slate-100 transition-colors">
                            <Link href="/dashboard/blogs">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900">{mode === "create" ? "Create New Blog" : "Edit Blog"}</h1>
                                    <p className="text-slate-600 mt-1">{mode === "create" ? "Write and publish a new blog post" : "Update blog post content and settings"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ✅ UPDATED: Action Buttons */}
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleSaveAsDraft} disabled={loading || !isFormValid}>
                            <Save className="h-4 w-4 mr-2" />
                            Save as Draft
                        </Button>
                        <Button onClick={handlePublish} disabled={loading || uploadingThumbnail || uploadingBanner || !isFormValid} className="px-7 py-5 bg-primary text-white disabled:opacity-50">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-2 h-5 w-5" />
                                    Publish Blog
                                </>
                            )}
                        </Button>
                    </div>
                </div>
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="flex gap-6">
                    {/* Left Column - Main Content */}
                    <div className="flex-1 space-y-6">
                        {/* Basic Information */}
                        <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                            <CardHeader className="border-b border-slate-200 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Basic Information</CardTitle>
                                        <CardDescription className="mt-1">Essential blog details</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        Blog Title <span className="text-red-500">*</span>
                                        {formData.title && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., 10 Tips for Successful Event Planning"
                                        className="h-11 border-slate-300 focus:border-blue-500"
                                        required
                                        maxLength={100}
                                    />
                                    <p className="text-xs text-slate-500">{formData.title.length}/100 characters</p>
                                </div>

                                <Separator />

                                {/* Slug */}
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        URL Slug <span className="text-red-500">*</span>
                                        {formData.slug && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    </Label>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        placeholder="e.g., 10-tips-event-planning"
                                        className="h-11 border-slate-300 focus:border-blue-500 font-mono text-sm"
                                        required
                                        maxLength={100}
                                    />
                                    <p className="text-xs text-slate-500">yoursite.com/blogs/{formData.slug || "your-slug"}</p>
                                </div>

                                <Separator />

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        Description <span className="text-red-500">*</span>
                                        {formData.description && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Brief description of the blog post..."
                                        rows={3}
                                        className="resize-none border-slate-300 focus:border-blue-500"
                                        required
                                        maxLength={160}
                                    />
                                    <p className="text-xs text-slate-500">{formData.description.length}/160 characters</p>
                                </div>

                                <Separator />

                                {/* Category and Author */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="categoryId" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            Category <span className="text-red-500">*</span>
                                            {formData.categoryId !== 0 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        </Label>
                                        <select
                                            id="categoryId"
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            className="w-full h-11 px-4 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            disabled={loadingCategories}
                                        >
                                            <option value={0}>Select category...</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="authorId" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            Author <span className="text-red-500">*</span>
                                            {formData.authorId !== 0 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        </Label>
                                        <select
                                            id="authorId"
                                            name="authorId"
                                            value={formData.authorId}
                                            onChange={handleChange}
                                            className="w-full h-11 px-4 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            disabled={loadingAuthors}
                                        >
                                            <option value={0}>Select author...</option>
                                            {authors.map((author) => (
                                                <option key={author.id} value={author.id}>
                                                    {author.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <Separator />

                                {/* Time to Read */}
                                <div className="space-y-2">
                                    <Label htmlFor="timeToRead" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Reading Time (optional)
                                    </Label>
                                    <Input
                                        id="timeToRead"
                                        name="timeToRead"
                                        value={formData.timeToRead}
                                        onChange={handleChange}
                                        placeholder="e.g., 5 min read"
                                        className="h-11 border-slate-300 focus:border-blue-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Content Editor */}
                        <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                            <CardHeader className="border-b border-slate-200 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <FileText className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Blog Content</CardTitle>
                                        <CardDescription className="mt-1">Write your blog post content</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <TiptapEditor content={editorContent} onChange={handleEditorChange} onHeadingsChange={handleHeadingsChange} />
                            </CardContent>
                        </Card>

                        {/* Images */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Thumbnail */}
                            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                                <CardHeader className="border-b border-slate-200 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <ImageIcon className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Thumbnail</CardTitle>
                                            <CardDescription>Max 4MB</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <ImageUploader
                                        files={thumbnailFiles}
                                        onChange={(files) => {
                                            setThumbnailFiles(files);
                                            handleThumbnailUpload(files);
                                        }}
                                        maxFiles={1}
                                        maxSize={4}
                                        accept="image/*"
                                    />
                                    {uploadingThumbnail && (
                                        <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                            <p className="text-sm text-blue-900">Uploading...</p>
                                        </div>
                                    )}
                                    {formData.thumbnail && !uploadingThumbnail && (
                                        <div className="mt-3 relative group">
                                            <img src={formData.thumbnail} alt="Thumbnail" className="w-full h-32 object-cover rounded-lg" />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                                                onClick={() => {
                                                    setFormData((prev) => ({ ...prev, thumbnail: "" }));
                                                    setThumbnailFiles([]);
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Banner */}
                            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                                <CardHeader className="border-b border-slate-200 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-pink-100 rounded-lg">
                                            <ImageIcon className="h-5 w-5 text-pink-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Banner</CardTitle>
                                            <CardDescription>Max 4MB</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <ImageUploader
                                        files={bannerFiles}
                                        onChange={(files) => {
                                            setBannerFiles(files);
                                            handleBannerUpload(files);
                                        }}
                                        maxFiles={1}
                                        maxSize={4}
                                        accept="image/*"
                                    />
                                    {uploadingBanner && (
                                        <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                            <p className="text-sm text-blue-900">Uploading...</p>
                                        </div>
                                    )}
                                    {formData.banner_image && !uploadingBanner && (
                                        <div className="mt-3 relative group">
                                            <img src={formData.banner_image} alt="Banner" className="w-full h-32 object-cover rounded-lg" />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                                                onClick={() => {
                                                    setFormData((prev) => ({ ...prev, banner_image: "" }));
                                                    setBannerFiles([]);
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* SEO Settings */}
                        <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                            <CardHeader className="border-b border-slate-200 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Tag className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">SEO Settings</CardTitle>
                                        <CardDescription className="mt-1">Optimize for search engines</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {/* Meta Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="metaTitle" className="text-sm font-semibold text-slate-700">
                                        Meta Title
                                    </Label>
                                    <Input
                                        id="metaTitle"
                                        name="metaTitle"
                                        value={formData.metaTitle}
                                        onChange={handleChange}
                                        placeholder={formData.title || "Leave empty to use blog title"}
                                        className="h-11 border-slate-300"
                                        maxLength={60}
                                    />
                                    <p className="text-xs text-slate-500">{formData.metaTitle.length}/60 characters</p>
                                </div>

                                {/* Meta Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="metaDescription" className="text-sm font-semibold text-slate-700">
                                        Meta Description
                                    </Label>
                                    <Textarea
                                        id="metaDescription"
                                        name="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={handleChange}
                                        placeholder={formData.description || "Leave empty to use blog description"}
                                        rows={2}
                                        className="resize-none border-slate-300"
                                        maxLength={160}
                                    />
                                    <p className="text-xs text-slate-500">{formData.metaDescription.length}/160 characters</p>
                                </div>

                                {/* Keywords */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700">Keywords</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={keywordInput}
                                            onChange={(e) => setKeywordInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddKeyword();
                                                }
                                            }}
                                            placeholder="Add keyword and press Enter"
                                            className="h-11 border-slate-300"
                                        />
                                        <Button type="button" onClick={handleAddKeyword} variant="outline">
                                            Add
                                        </Button>
                                    </div>
                                    {formData.keywords.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.keywords.map((keyword, index) => (
                                                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                    {keyword}
                                                    <button type="button" onClick={() => handleRemoveKeyword(keyword)} className="hover:bg-blue-200 rounded-full p-0.5">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Canonical URL */}
                                <div className="space-y-2">
                                    <Label htmlFor="canonical" className="text-sm font-semibold text-slate-700">
                                        Canonical URL
                                    </Label>
                                    <Input
                                        id="canonical"
                                        name="canonical"
                                        value={formData.canonical}
                                        onChange={handleChange}
                                        placeholder={`https://yoursite.com/blogs/${formData.slug || "your-slug"}`}
                                        className="h-11 border-slate-300 font-mono text-sm"
                                    />
                                </div>

                                {/* Schema Script */}
                                <div className="space-y-2">
                                    <Label htmlFor="schemaScript" className="text-sm font-semibold text-slate-700">
                                        Schema Markup (JSON-LD)
                                    </Label>
                                    <Textarea
                                        id="schemaScript"
                                        name="schemaScript"
                                        value={formData.schemaScript}
                                        onChange={handleChange}
                                        placeholder='{"@context": "https://schema.org", ...}'
                                        rows={6}
                                        className="resize-none border-slate-300 font-mono text-xs"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Table of Contents */}
                    <div className="w-80 shrink-0">
                        <div className="sticky top-6">
                            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                                <CardHeader className="border-b border-slate-200 px-4 py-3">
                                    <CardTitle className="text-lg">Table of Contents</CardTitle>
                                    <CardDescription>Article structure</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <TableOfContents headings={headings} />
                                    {/* Type '{ content: string; }' is not assignable to type 'IntrinsicAttributes & TableOfContentsProps'.
  Property 'content' does not exist on type 'IntrinsicAttributes & TableOfContentsProps'.ts(2322)
⚠ Error (TS2322)  |  |  | 

Type 
 is not assignable to type 
 .
   

Property content does not exist on type 
 .
(property) content: string
*/}
                                </CardContent>
                            </Card>

                            {/* Form Validation Status */}
                            <Card className="mt-4 border-slate-200 shadow-lg shadow-slate-200/50">
                                <CardHeader className="border-b border-slate-200 px-4 py-3">
                                    <CardTitle className="text-lg">Completion Status</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        {formData.title ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-slate-400" />}
                                        <span className={formData.title ? "text-slate-700" : "text-slate-400"}>Title</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        {formData.slug ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-slate-400" />}
                                        <span className={formData.slug ? "text-slate-700" : "text-slate-400"}>URL Slug</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        {formData.description ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-slate-400" />}
                                        <span className={formData.description ? "text-slate-700" : "text-slate-400"}>Description</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        {formData.content ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-slate-400" />}
                                        <span className={formData.content ? "text-slate-700" : "text-slate-400"}>Content</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        {formData.thumbnail ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-slate-400" />}
                                        <span className={formData.thumbnail ? "text-slate-700" : "text-slate-400"}>Thumbnail</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        {formData.banner_image ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-slate-400" />}
                                        <span className={formData.banner_image ? "text-slate-700" : "text-slate-400"}>Banner Image</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        {formData.categoryId !== 0 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-slate-400" />}
                                        <span className={formData.categoryId !== 0 ? "text-slate-700" : "text-slate-400"}>Category</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        {formData.authorId !== 0 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-slate-400" />}
                                        <span className={formData.authorId !== 0 ? "text-slate-700" : "text-slate-400"}>Author</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
