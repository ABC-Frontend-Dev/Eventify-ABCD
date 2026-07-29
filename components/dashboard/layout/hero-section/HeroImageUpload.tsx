"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToasts } from "@/components/ui/toast";
import { Loader2, X } from "lucide-react";

interface HeroImageUploadProps {
    editingImageId: number | null;
    imageFormData: {
        imageUrl: string;
        altText: string;
        title: string;
        description: string;
    };
    onImageFormDataChange: (data: any) => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
}

function FieldLabel({ children, required, ok }: { children: React.ReactNode; required?: boolean; ok?: boolean }) {
    return (
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
            {children}
            {required && <span className="text-red-400">*</span>}
            {ok && <span className="text-emerald-500">✓</span>}
        </label>
    );
}

export default function HeroImageUpload({ editingImageId, imageFormData, onImageFormDataChange, onSave, onCancel, saving }: HeroImageUploadProps) {
    const toast = useToasts();
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    const uploadFile = async (file: File, folder: string = "hero"): Promise<string | null> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`/api/upload?folder=${folder}`, { method: "POST", body: fd });
        const result = await res.json();
        return result.success ? result.path : null;
    };

    const validateFile = (file: File, maxSizeMB: number): boolean => {
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            toast.error(`File size must be less than ${maxSizeMB}MB. Current size: ${fileSizeMB.toFixed(2)}MB`);
            return false;
        }
        return true;
    };

    const handleImageUpload = async (files: File[]) => {
        if (!files.length) return;
        const file = files[0];

        if (!validateFile(file, 1)) return;

        setUploadingImage(true);
        const path = await uploadFile(file, "hero");
        setUploadingImage(false);
        setImageFiles([]);

        if (path) {
            onImageFormDataChange({ ...imageFormData, imageUrl: path });
            toast.success("Image uploaded successfully");
        } else {
            toast.error("Failed to upload image");
        }
    };

    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

    return (
        <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">{editingImageId ? "Edit Image" : "Add New Image"}</h3>

            <div className="space-y-4">
                <div>
                    <FieldLabel required ok={!!imageFormData.imageUrl}>
                        Upload Image (Max 1MB)
                    </FieldLabel>
                    <p className="text-[11px] text-slate-400 mb-2">Supported: jpg, jpeg, png, webp</p>

                    <ImageUploader
                        files={imageFiles}
                        onChange={(f) => {
                            setImageFiles(f);
                            handleImageUpload(f);
                        }}
                        maxFiles={1}
                        maxSize={1}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                    />

                    {uploadingImage && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading image…
                        </div>
                    )}

                    {imageFormData.imageUrl && !uploadingImage && (
                        <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100 w-fit">
                            <img src={imageFormData.imageUrl} alt="Preview" className="h-20 w-auto object-cover" />
                            <button
                                type="button"
                                onClick={() => onImageFormDataChange({ ...imageFormData, imageUrl: "" })}
                                className="absolute top-1 right-1 p-1 rounded-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <FieldLabel>Alt Text (Optional)</FieldLabel>
                    <p className="text-[11px] text-slate-400 mb-2">Fallback: title → "Eventify Entertainment"</p>
                    <Input value={imageFormData.altText} onChange={(e) => onImageFormDataChange({ ...imageFormData, altText: e.target.value })} placeholder="Describe the image" className={inp} />
                </div>

                <div>
                    <FieldLabel>Title (Optional)</FieldLabel>
                    <Input
                        value={imageFormData.title}
                        onChange={(e) => onImageFormDataChange({ ...imageFormData, title: e.target.value })}
                        placeholder="e.g. Turning Moments Into Spectacular Experiences"
                        className={inp}
                    />
                </div>

                <div>
                    <FieldLabel>Description (Optional)</FieldLabel>
                    <Textarea
                        value={imageFormData.description}
                        onChange={(e) => onImageFormDataChange({ ...imageFormData, description: e.target.value })}
                        placeholder="e.g. We transform ideas into world-class events..."
                        rows={3}
                        className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                    />
                </div>

                <div className="flex gap-2">
                    <Button onClick={onSave} disabled={saving || uploadingImage || !imageFormData.imageUrl} className="flex-1 bg-slate-900 hover:bg-slate-700 text-white">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {editingImageId ? "Update Image" : "Add Image"}
                    </Button>

                    {editingImageId && (
                        <Button onClick={onCancel} variant="outline">
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
