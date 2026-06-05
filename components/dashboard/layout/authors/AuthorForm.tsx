// components/dashboard/layout/authors/AuthorForm.tsx
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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "../common/Header";

interface AuthorFormProps {
    initialData?: {
        name: string;
        email: string;
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
        bio: initialData?.bio || "",
        avatar: initialData?.avatar || "",
    });

    // For Edit mode - fetch latest data
    useEffect(() => {
        if (mode === "edit" && authorId) {
            fetch(`/api/authors/${authorId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.data) {
                        setFormData({
                            name: data.data.name,
                            email: data.data.email,
                            bio: data.data.bio || "",
                            avatar: data.data.avatar || "",
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Failed to load author data");
                });
        }
    }, [mode, authorId, toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle file upload to server
    const handleFileUpload = async (uploadedFiles: File[]) => {
        if (uploadedFiles.length === 0) return;

        setUploading(true);
        const file = uploadedFiles[0]; // Take only the first file

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
                    avatar: result.path,
                }));
                toast.success("Avatar uploaded successfully!");
            } else {
                toast.error(result.error || "Failed to upload avatar");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload avatar");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.warning("Please enter an author name");
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

                // Redirect after a short delay
                setTimeout(() => {
                    router.push("/dashboard/authors");
                    router.refresh();
                }, 1000);
            } else {
                toast.error(result.message || result.error || "Failed to save author");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl w-full mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/authors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <DashboardHeader
                        title={mode === "create" ? "Add New Author" : "Edit Author"}
                        description={mode === "create" ? "Create a new author entry" : "Update existing author information"}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Author Details</CardTitle>
                    <CardDescription>Fields marked with * are required</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Author Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Author Name <span className="text-red-500">*</span>
                            </Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Author 25" required />
                        </div>

                        {/* Author Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Author Email <span className="text-red-500">*</span>
                            </Label>
                            <Input id="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. author25@example.com" required />
                        </div>

                        {/* Image Uploader */}
                        <div className="space-y-2">
                            <Label>
                                Author Avatar <span className="text-red-500">*</span>
                            </Label>
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
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading image...
                                </p>
                            )}
                        </div>

                        {/* Image Path (Read-only) */}
                        <div className="space-y-2">
                            <Label htmlFor="avatar">Image Path</Label>
                            <Input id="avatar" name="avatar" value={formData.avatar} onChange={handleChange} placeholder="/images/our-authors/author-avatar.png" readOnly className="bg-muted" />
                            {/* {formData.avatar && (
                                <div className="mt-3 flex justify-center border rounded-lg p-4 bg-gray-50">
                                    <img
                                        src={formData.avatar}
                                        alt="preview"
                                        className="h-24 object-contain"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder.png";
                                            toast.error("Failed to load image preview");
                                        }}
                                    />
                                </div>
                            )} */}
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about the author..." rows={4} />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={loading || uploading} className="flex-1">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {mode === "create" ? "Creating..." : "Updating..."}
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {mode === "create" ? "Create Author" : "Update Author"}
                                    </>
                                )}
                            </Button>

                            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading || uploading}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
