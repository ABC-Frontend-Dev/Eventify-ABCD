// components/dashboard/layout/projects/ProjectForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToasts } from "@/components/ui/toast";
import { ArrowLeft, Save, Loader2, X, Image as ImageIcon, FolderOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "../common/Header";
import { Separator } from "@/components/ui/separator";

interface ProjectCategory {
    id: number;
    name: string;
    description: string | null;
}

interface ProjectFormProps {
    initialData?: {
        title: string;
        description: string;
        bannerImage: string;
        images: string[];
        categoryId: number;
    };
    projectId?: number;
    mode: "create" | "edit";
}

export default function ProjectForm({ initialData, projectId, mode }: ProjectFormProps) {
    const router = useRouter();
    const toast = useToasts();

    const [loading, setLoading] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [categories, setCategories] = useState<ProjectCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [bannerFiles, setBannerFiles] = useState<File[]>([]);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        bannerImage: initialData?.bannerImage || "",
        images: initialData?.images || [],
        categoryId: initialData?.categoryId || 0,
    });

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/project-categories");
                const result = await response.json();

                if (result.success) {
                    setCategories(result.data);
                } else {
                    toast.error("Failed to load categories");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to load categories");
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // For Edit mode - fetch latest data
    useEffect(() => {
        if (mode === "edit" && projectId) {
            fetch(`/api/projects/${projectId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.data) {
                        setFormData({
                            title: data.data.title,
                            description: data.data.description,
                            bannerImage: data.data.bannerImage,
                            images: data.data.images || [],
                            categoryId: data.data.categoryId,
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Failed to load project data");
                });
        }
    }, [mode, projectId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "categoryId" ? parseInt(value) : value,
        }));
    };

    // Handle banner image upload
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
                    bannerImage: result.path,
                }));
                toast.success("Banner image uploaded successfully!");
            } else {
                toast.error(result.error || "Failed to upload banner image");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload banner image");
        } finally {
            setUploadingBanner(false);
        }
    };

    // Handle multiple gallery images upload
    const handleGalleryUpload = async (uploadedFiles: File[]) => {
        if (uploadedFiles.length === 0) return;

        setUploadingImages(true);

        try {
            const uploadPromises = uploadedFiles.map(async (file) => {
                const formDataUpload = new FormData();
                formDataUpload.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                });

                const result = await response.json();
                return result.success ? result.path : null;
            });

            const uploadedPaths = await Promise.all(uploadPromises);
            const successfulUploads = uploadedPaths.filter((path) => path !== null) as string[];

            if (successfulUploads.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    images: [...prev.images, ...successfulUploads],
                }));
                toast.success(`${successfulUploads.length} image(s) uploaded successfully!`);
            }

            if (successfulUploads.length < uploadedFiles.length) {
                toast.warning("Some images failed to upload");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload images");
        } finally {
            setUploadingImages(false);
            setGalleryFiles([]);
        }
    };

    // Remove image from gallery
    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
        toast.success("Image removed");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.warning("Please enter a project title");
            return;
        }

        if (!formData.description.trim()) {
            toast.warning("Please enter a project description");
            return;
        }

        if (!formData.bannerImage.trim()) {
            toast.warning("Please upload a banner image");
            return;
        }

        if (formData.images.length === 0) {
            toast.warning("Please upload at least one project image");
            return;
        }

        if (!formData.categoryId || formData.categoryId === 0) {
            toast.warning("Please select a project category");
            return;
        }

        setLoading(true);

        try {
            const url = mode === "create" ? "/api/projects" : `/api/projects/${projectId}`;

            const response = await fetch(url, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(mode === "create" ? "Project created successfully!" : "Project updated successfully!");

                setTimeout(() => {
                    router.push("/dashboard/projects");
                    router.refresh();
                }, 1000);
            } else {
                toast.error(result.message || result.error || "Failed to save project");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.title && formData.description && formData.bannerImage && formData.images.length > 0 && formData.categoryId !== 0;

    return (
        <div className="">
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between gap-5">
                    <div className="flex items-start justify-center gap-4">
                        <Button variant="outline" size="icon" asChild className="mt-1 shrink-0 hover:bg-slate-100 transition-colors">
                            <Link href="/dashboard/projects">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="flex-1">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                    <FolderOpen className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900">{mode === "create" ? "Create New Project" : "Edit Project"}</h1>
                                    <p className="text-slate-600 mt-1">{mode === "create" ? "Add a new project to your portfolio" : "Update project information and media"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <Card className="border-transparent rounded-lg p-0 border-none ring-0 shadow-none">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        type="submit"
                                        disabled={loading || uploadingBanner || uploadingImages || !isFormValid}
                                        className="flex-1 px-7 py-5 bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                {mode === "create" ? "Creating Project..." : "Updating Project..."}
                                            </>
                                        ) : (
                                            <>{mode === "create" ? "Create Project" : "Update Project"}</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Card */}
                    <div className="flex flex-row gap-6">
                        <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                            <CardHeader className="border-b border-slate-200 px-3 py-2 gap-0">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Basic Information</CardTitle>
                                        <CardDescription className="mt-1">Essential project details and categorization</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {/* Project Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        Project Title <span className="text-red-500">*</span>
                                        {formData.title && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., Annual Tech Conference 2024"
                                        className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    <p className="text-xs text-slate-500">Choose a clear, descriptive title for your project</p>
                                </div>

                                <Separator className="my-4" />

                                {/* Project Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="categoryId" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        Project Category <span className="text-red-500">*</span>
                                        {formData.categoryId !== 0 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    </Label>
                                    <div className="relative">
                                        <select
                                            id="categoryId"
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            className="w-full h-11 px-4 pr-10 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                                            required
                                            disabled={loadingCategories}
                                        >
                                            <option value={0}>Select a category...</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {loadingCategories && (
                                        <p className="text-xs text-slate-500 flex items-center gap-2">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Loading categories...
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-500">Select the category that best describes this project</p>
                                </div>

                                <Separator className="my-4" />

                                {/* Project Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        Project Description <span className="text-red-500">*</span>
                                        {formData.description && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Provide a detailed description of the project, including key highlights, achievements, and unique aspects..."
                                        rows={6}
                                        className="resize-none border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-slate-500">Write a compelling description to showcase your project</p>
                                        <span className="text-xs text-slate-400">{formData.description.length} characters</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="space-y-6 flex-1">
                            {/* Banner Image Card */}
                            <Card className="border-slate-200 shadow-lg shadow-slate-200/50 pt-0">
                                <CardHeader className="border-b border-slate-200 px-3 py-2 gap-0 px-3 py-2 gap-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <ImageIcon className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">Banner Image</CardTitle>
                                            <CardDescription className="mt-1">Upload a high-quality banner image (Max 4MB)</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-4">
                                    <ImageUploader
                                        files={bannerFiles}
                                        onChange={(newFiles) => {
                                            setBannerFiles(newFiles);
                                            handleBannerUpload(newFiles);
                                        }}
                                        maxFiles={1}
                                        maxSize={4}
                                        accept="image/*"
                                    />

                                    {uploadingBanner && (
                                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-900">Uploading banner image...</p>
                                                <p className="text-xs text-blue-700">Please wait while we process your image</p>
                                            </div>
                                        </div>
                                    )}

                                    {formData.bannerImage && !uploadingBanner && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                <p className="text-sm font-medium text-green-700">Banner image uploaded successfully</p>
                                            </div>
                                            <div className="relative group overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50">
                                                <img src={formData.bannerImage} alt="Banner preview" className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setFormData((prev) => ({ ...prev, bannerImage: "" }));
                                                            setBannerFiles([]);
                                                        }}
                                                        className="bg-white/90 hover:bg-white"
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Remove Banner
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Project Gallery Card */}
                            <Card className="pt-0">
                                <CardHeader className="border-b border-slate-200 px-3 py-2 gap-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <ImageIcon className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl">Project Gallery</CardTitle>
                                                <CardDescription className="mt-1">Upload multiple images to showcase your project (Max 10 images, 4MB each)</CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <ImageUploader
                                        files={galleryFiles}
                                        onChange={(newFiles) => {
                                            setGalleryFiles(newFiles);
                                            handleGalleryUpload(newFiles);
                                        }}
                                        maxFiles={10 - formData.images.length}
                                        maxSize={4}
                                        accept="image/*"
                                    />

                                    {uploadingImages && (
                                        <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                            <div>
                                                <p className="text-sm font-medium text-purple-900">Uploading gallery images...</p>
                                                <p className="text-xs text-purple-700">Processing {galleryFiles.length} image(s)</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Display uploaded images */}
                                    {formData.images.length > 0 && (
                                        <div className="space-y-4">
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold text-slate-700">Uploaded Images</h4>
                                                <span className="text-xs text-slate-500">{formData.images.length}/10 image(s)</span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {formData.images.map((image, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50">
                                                            <img
                                                                src={image}
                                                                alt={`Gallery ${index + 1}`}
                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                            />
                                                        </div>
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                                            <Button type="button" size="sm" variant="destructive" onClick={() => removeImage(index)} className="shadow-lg">
                                                                <X className="h-4 w-4" />
                                                                {/* Remove */}
                                                            </Button>
                                                        </div>
                                                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">#{index + 1}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {formData.images.length === 0 && !uploadingImages && (
                                        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                                            <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                            <p className="text-sm font-medium text-slate-600">No images uploaded yet</p>
                                            <p className="text-xs text-slate-500 mt-1">Upload at least one image to continue</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        {/* Action Buttons */}
                    </div>
                </form>
            </div>
        </div>
    );
}
