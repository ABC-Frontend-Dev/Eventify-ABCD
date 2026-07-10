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
import { Switch } from "@/components/ui/switch";
import { useToasts } from "@/components/ui/toast";
import { ArrowLeft, Save, Loader2, X, Image as ImageIcon, FolderOpen, AlertCircle, CheckCircle2, Plus, Edit, Trash2, Layers } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface ProjectCategory {
    id: number;
    name: string;
    description: string | null;
}

interface ProjectTab {
    id?: number;
    tempId: string;
    name: string;
    images: string[];
}

interface ProjectFormProps {
    initialData?: {
        title: string;
        description: string;
        bannerImage: string;
        images: string[];
        categoryId: number;
        hasTabs: boolean;
        tabs: Array<{
            id: number;
            name: string;
            images: string[];
            order: number;
        }>;
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
        hasTabs: initialData?.hasTabs || false,
    });

    const [tabs, setTabs] = useState<ProjectTab[]>(
        initialData?.tabs?.map((tab) => ({
            id: tab.id,
            tempId: `tab-${tab.id}`,
            name: tab.name,
            images: tab.images,
        })) || [],
    );

    const [isTabModalOpen, setIsTabModalOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState<ProjectTab | null>(null);
    const [tabImageFiles, setTabImageFiles] = useState<File[]>([]);
    const [uploadingTabImages, setUploadingTabImages] = useState(false);

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
                            hasTabs: data.data.hasTabs || false,
                        });

                        if (data.data.tabs && data.data.tabs.length > 0) {
                            setTabs(
                                data.data.tabs.map((tab: any) => ({
                                    id: tab.id,
                                    tempId: `tab-${tab.id}`,
                                    name: tab.name,
                                    images: tab.images,
                                })),
                            );
                        }
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

        // Check if file is video or image
        const isVideo = file.type.startsWith("video/");

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
                toast.success(`Banner ${isVideo ? "video" : "image"} uploaded successfully!`);
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

    // Handle multiple gallery images upload (for non-tab projects)
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

    // Remove image from gallery (non-tab projects)
    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
        toast.success("Image removed");
    };

    // TAB MANAGEMENT FUNCTIONS

    // Add new tab
    const handleAddTab = () => {
        setCurrentTab({
            tempId: `temp-${Date.now()}`,
            name: "",
            images: [],
        });
        setIsTabModalOpen(true);
    };

    // Edit existing tab
    const handleEditTab = (tab: ProjectTab) => {
        setCurrentTab({ ...tab });
        setIsTabModalOpen(true);
    };

    // Delete tab
    const handleDeleteTab = (tempId: string) => {
        setTabs(tabs.filter((t) => t.tempId !== tempId));
        toast.success("Tab deleted");
    };

    // Save tab (create or update)
    const handleSaveTab = () => {
        if (!currentTab?.name.trim()) {
            toast.warning("Tab name is required");
            return;
        }

        if (currentTab.images.length === 0) {
            toast.warning("Add at least one image to the tab");
            return;
        }

        const existingTabIndex = tabs.findIndex((t) => t.tempId === currentTab.tempId);

        if (existingTabIndex >= 0) {
            // Update existing tab
            const updatedTabs = [...tabs];
            updatedTabs[existingTabIndex] = currentTab;
            setTabs(updatedTabs);
            toast.success("Tab updated");
        } else {
            // Add new tab
            setTabs([...tabs, currentTab]);
            toast.success("Tab added");
        }

        setIsTabModalOpen(false);
        setCurrentTab(null);
        setTabImageFiles([]);
    };

    // Upload images for tab
    const handleTabImageUpload = async (uploadedFiles: File[]) => {
        if (uploadedFiles.length === 0 || !currentTab) return;

        setUploadingTabImages(true);

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
                setCurrentTab({
                    ...currentTab,
                    images: [...currentTab.images, ...successfulUploads],
                });
                toast.success(`${successfulUploads.length} image(s) uploaded!`);
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload images");
        } finally {
            setUploadingTabImages(false);
            setTabImageFiles([]);
        }
    };

    // Remove image from tab
    const removeTabImage = (index: number) => {
        if (!currentTab) return;
        setCurrentTab({
            ...currentTab,
            images: currentTab.images.filter((_, i) => i !== index),
        });
    };

    // Handle tabs toggle
    const handleTabsToggle = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, hasTabs: checked }));
        if (!checked) {
            setTabs([]);
        }
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

        if (!formData.categoryId || formData.categoryId === 0) {
            toast.warning("Please select a project category");
            return;
        }

        if (formData.hasTabs) {
            if (tabs.length === 0) {
                toast.warning("Please add at least one tab or disable tabs");
                return;
            }
        } else {
            if (formData.images.length === 0) {
                toast.warning("Please upload at least one project image");
                return;
            }
        }

        setLoading(true);

        try {
            const url = mode === "create" ? "/api/projects" : `/api/projects/${projectId}`;

            const payload = {
                ...formData,
                tabs: formData.hasTabs ? tabs.map(({ name, images }) => ({ name, images })) : undefined,
            };

            const response = await fetch(url, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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

    const isFormValid = formData.title && formData.description && formData.bannerImage && formData.categoryId !== 0 && (formData.hasTabs ? tabs.length > 0 : formData.images.length > 0);

    return (
        <div className="">
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between gap-5">
                    <div className="flex items-start justify-center gap-4">
                        <Button variant="outline" size="icon" asChild className="mt-1 shrink-0">
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

                    <Card className="border-transparent rounded-lg p-0 border-none ring-0 shadow-none">
                        <CardContent className="p-0">
                            <Button
                                type="submit"
                                form="project-form"
                                disabled={loading || uploadingBanner || uploadingImages || !isFormValid}
                                className="px-7 py-5 bg-primary text-white disabled:opacity-50 transition-all duration-300"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {mode === "create" ? "Creating..." : "Updating..."}
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        {mode === "create" ? "Create Project" : "Update Project"}
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-6" id="project-form">
                    <div className="flex flex-row gap-6">
                        {/* Basic Information Card */}
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
                                        placeholder="Provide a detailed description..."
                                        rows={6}
                                        className="resize-none border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-slate-500">Write a compelling description</p>
                                        <span className="text-xs text-slate-400">{formData.description.length} characters</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column */}
                        <div className="space-y-6 flex-1">
                            {/* Banner Image Card */}
                            <Card className="border-slate-200 shadow-lg shadow-slate-200/50 pt-0">
                                <CardHeader className="border-b border-slate-200 px-3 py-2 gap-0">
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
                                <CardContent className="pt-6 space-y-4">
                                    <ImageUploader
                                        files={bannerFiles}
                                        onChange={(newFiles) => {
                                            setBannerFiles(newFiles);
                                            handleBannerUpload(newFiles);
                                        }}
                                        maxFiles={1}
                                        maxSize={10} // 50MB
                                        accept="image/*,video/*" // Accept both images and videos
                                    />

                                    {uploadingBanner && (
                                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-900">Uploading banner image...</p>
                                            </div>
                                        </div>
                                    )}

                                    {formData.bannerImage && !uploadingBanner && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                <p className="text-sm font-medium text-green-700">Banner uploaded</p>
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
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Tabs Toggle */}
                            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Layers className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Enable Tabs</p>
                                                <p className="text-sm text-slate-500">Organize images into categorized tabs</p>
                                            </div>
                                        </div>
                                        <Switch checked={formData.hasTabs} onCheckedChange={handleTabsToggle} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Conditional: Tabs or Gallery */}
                            {formData.hasTabs ? (
                                /* TABS SECTION */
                                <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                                    <CardHeader className="border-b border-slate-200 px-3 py-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <Layers className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl">Project Tabs ({tabs.length})</CardTitle>
                                                    <CardDescription className="mt-1">Organize your project images by categories</CardDescription>
                                                </div>
                                            </div>
                                            <Button type="button" onClick={handleAddTab} size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Tab
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {tabs.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                                                <Layers className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                                <p className="text-sm font-medium text-slate-600">No tabs created yet</p>
                                                <p className="text-xs text-slate-500 mt-1">Click "Add Tab" to create your first tab</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {tabs.map((tab) => (
                                                    <div key={tab.tempId} className="flex items-center justify-between p-4 border rounded-lg hover:border-purple-300 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                                <Layers className="h-6 w-6 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900">{tab.name}</p>
                                                                <p className="text-sm text-slate-500">{tab.images.length} images</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button type="button" variant="outline" size="sm" onClick={() => handleEditTab(tab)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button type="button" variant="outline" size="sm" onClick={() => handleDeleteTab(tab.tempId)}>
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                /* GALLERY SECTION (No Tabs) */
                                <Card className="pt-0 border-slate-200 shadow-lg shadow-slate-200/50">
                                    <CardHeader className="border-b border-slate-200 px-3 py-2 gap-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <ImageIcon className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl">Project Gallery</CardTitle>
                                                    <CardDescription className="mt-1">Upload multiple images (Max 10 images, 4MB each)</CardDescription>
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
                                            maxSize={10}
                                            accept="image/*,video/*"
                                        />

                                        {uploadingImages && (
                                            <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-purple-900">Uploading images...</p>
                                                    <p className="text-xs text-purple-700">Processing {galleryFiles.length} image(s)</p>
                                                </div>
                                            </div>
                                        )}

                                        {formData.images.length > 0 && (
                                            <div className="space-y-4">
                                                <Separator />
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-slate-700">Uploaded Images</h4>
                                                    <span className="text-xs text-slate-500">{formData.images.length}/10 image(s)</span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                                                                <Button type="button" size="sm" variant="destructive" onClick={() => removeImage(index)}>
                                                                    <X className="h-4 w-4" />
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
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* TAB MODAL */}
            {isTabModalOpen && currentTab && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Layers className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">{tabs.find((t) => t.tempId === currentTab.tempId) ? "Edit Tab" : "Add New Tab"}</h3>
                                    <p className="text-sm text-slate-500">Create a categorized section for your project images</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setIsTabModalOpen(false);
                                    setCurrentTab(null);
                                    setTabImageFiles([]);
                                }}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Tab Name */}
                            <div className="space-y-2">
                                <Label htmlFor="tab-name" className="text-sm font-semibold">
                                    Tab Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="tab-name"
                                    value={currentTab.name}
                                    onChange={(e) => setCurrentTab({ ...currentTab, name: e.target.value })}
                                    placeholder="e.g., Interior, Exterior, Stage Setup, Decoration"
                                    className="h-11"
                                />
                                <p className="text-xs text-slate-500">Give this tab a descriptive name</p>
                            </div>

                            <Separator />

                            {/* Tab Images */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold">
                                        Tab Images ({currentTab.images.length}) <span className="text-red-500">*</span>
                                    </Label>
                                </div>

                                <ImageUploader
                                    files={tabImageFiles}
                                    onChange={(newFiles) => {
                                        setTabImageFiles(newFiles);
                                        handleTabImageUpload(newFiles);
                                    }}
                                    maxFiles={20 - currentTab.images.length}
                                    maxSize={4}
                                    accept="image/*"
                                />

                                {uploadingTabImages && (
                                    <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                        <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                        <p className="text-sm font-medium text-purple-900">Uploading images...</p>
                                    </div>
                                )}

                                {currentTab.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        {currentTab.images.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200">
                                                    <img src={img} alt={`Tab image ${index + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                    <Button type="button" size="sm" variant="destructive" onClick={() => removeTabImage(index)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">#{index + 1}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {currentTab.images.length === 0 && !uploadingTabImages && (
                                    <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                                        <ImageIcon className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                                        <p className="text-sm text-slate-600">No images in this tab yet</p>
                                        <p className="text-xs text-slate-500 mt-1">Upload at least one image</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3">
                            <Button onClick={handleSaveTab} className="flex-1" disabled={!currentTab.name.trim() || currentTab.images.length === 0}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Tab
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsTabModalOpen(false);
                                    setCurrentTab(null);
                                    setTabImageFiles([]);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
