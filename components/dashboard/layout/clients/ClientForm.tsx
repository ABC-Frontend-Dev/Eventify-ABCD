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

interface ClientFormProps {
    initialData?: {
        name: string;
        description: string;
        image: string;
    };
    clientId?: number;
    mode: "create" | "edit";
}

export default function ClientForm({ initialData, clientId, mode }: ClientFormProps) {
    const router = useRouter();
    const toast = useToasts();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        image: initialData?.image || "",
    });

    // For Edit mode - fetch latest data
    useEffect(() => {
        if (mode === "edit" && clientId) {
            fetch(`/api/clients/${clientId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.data) {
                        setFormData({
                            name: data.data.name,
                            description: data.data.description || "",
                            image: data.data.image,
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Failed to load client data");
                });
        }
    }, [mode, clientId]);

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
                    image: result.path,
                }));
                toast.success("Image uploaded successfully!");
            } else {
                toast.error(result.error || "Failed to upload image");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.warning("Please enter a client name");
            return;
        }

        if (!formData.image.trim()) {
            toast.warning("Please upload a client logo");
            return;
        }

        setLoading(true);

        try {
            const url = mode === "create" ? "/api/clients" : `/api/clients/${clientId}`;

            const response = await fetch(url, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(mode === "create" ? "Client created successfully!" : "Client updated successfully!");

                // Redirect after a short delay
                setTimeout(() => {
                    router.push("/dashboard/clients");
                    router.refresh();
                }, 1000);
            } else {
                toast.error(result.message || result.error || "Failed to save client");
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
                    <Link href="/dashboard/clients">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <DashboardHeader
                        title={mode === "create" ? "Add New Client" : "Edit Client"}
                        description={mode === "create" ? "Create a new client entry" : "Update existing client information"}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Client Details</CardTitle>
                    <CardDescription>Fields marked with * are required</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Client Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Client Name <span className="text-red-500">*</span>
                            </Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Client 25" required />
                        </div>

                        {/* Image Uploader */}
                        <div className="space-y-2">
                            <Label>
                                Client Logo <span className="text-red-500">*</span>
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
                            <Label htmlFor="image">Image Path</Label>
                            <Input id="image" name="image" value={formData.image} onChange={handleChange} placeholder="/images/our-clients/client-logo.png" readOnly className="bg-muted" />
                            {/* {formData.image && (
                                <div className="mt-3 flex justify-center border rounded-lg p-4 bg-gray-50">
                                    <img
                                        src={formData.image}
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

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Premium partner since 2026..." rows={4} />
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
                                        {mode === "create" ? "Create Client" : "Update Client"}
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
