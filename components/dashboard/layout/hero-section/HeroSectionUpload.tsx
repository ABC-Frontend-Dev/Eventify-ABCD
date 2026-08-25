// components/dashboard/layout/hero-section/HeroSectionUpload.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToasts } from "@/components/ui/toast";
import { Loader2, X } from "lucide-react";

interface HeroSectionUploadProps {
    heroSection: any;
    onSave: () => void;
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

function SectionHeading({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );
}

export default function HeroSectionUpload({ heroSection, onSave }: HeroSectionUploadProps) {
    const toast = useToasts();
    const [saving, setSaving] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);

    const [videoFormData, setVideoFormData] = useState({
        videoUrl: heroSection?.videoUrl || "",
        videoTitle: heroSection?.videoTitle || "",
        videoDesc: heroSection?.videoDesc || "",
    });

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

    const handleVideoUpload = async (files: File[]) => {
        if (!files.length) return;
        const file = files[0];

        if (!validateFile(file, 30)) return;

        setUploadingVideo(true);
        const path = await uploadFile(file, "videos");
        setUploadingVideo(false);
        setVideoFiles([]);

        if (path) {
            setVideoFormData((p) => ({ ...p, videoUrl: path }));
            toast.success("Video uploaded successfully");
        } else {
            toast.error("Failed to upload video");
        }
    };

    const handleSaveVideo = async () => {
        if (!videoFormData.videoUrl) {
            toast.error("Please upload a video");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/hero-section", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mediaType: "video",
                    ...videoFormData,
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Video section updated successfully");
                onSave();
            } else {
                toast.error(data.error || "Failed to save");
            }
        } catch (error) {
            console.error("Error saving video:", error);
            toast.error("Failed to save video section");
        } finally {
            setSaving(false);
        }
    };

    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

    return (
        <section className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <SectionHeading label="Video Hero" />

            <div className="space-y-4">
                <div>
                    <FieldLabel required ok={!!videoFormData.videoUrl}>
                        Upload Video (Max 30MB)
                    </FieldLabel>
                    <p className="text-[11px] text-slate-400 mb-2">Supported: mp4, webm</p>

                    <ImageUploader
                        files={videoFiles}
                        onChange={(f) => {
                            setVideoFiles(f);
                            handleVideoUpload(f);
                        }}
                        maxFiles={1}
                        maxSize={30}
                        accept="video/mp4,video/webm"
                    />

                    {uploadingVideo && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading video…
                        </div>
                    )}

                    {videoFormData.videoUrl && !uploadingVideo && (
                        <div className="mt-3">
                            <video src={videoFormData.videoUrl} className="w-full h-40 object-cover rounded-lg border border-slate-100" controls />
                            <button type="button" onClick={() => setVideoFormData((p) => ({ ...p, videoUrl: "" }))} className="mt-2 text-xs text-red-500 hover:text-red-700">
                                Remove video
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <FieldLabel>Title (Optional)</FieldLabel>
                    <Input
                        value={videoFormData.videoTitle}
                        onChange={(e) => setVideoFormData((p) => ({ ...p, videoTitle: e.target.value }))}
                        placeholder="e.g. Turning Moments Into Spectacular Experiences"
                        className={inp}
                    />
                </div>

                <div>
                    <FieldLabel>Description (Optional)</FieldLabel>
                    <Textarea
                        value={videoFormData.videoDesc}
                        onChange={(e) => setVideoFormData((p) => ({ ...p, videoDesc: e.target.value }))}
                        placeholder="e.g. We transform ideas into world-class events..."
                        rows={3}
                        className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                    />
                </div>

                <Button onClick={handleSaveVideo} disabled={saving || uploadingVideo || !videoFormData.videoUrl} className="w-full bg-slate-900 hover:bg-slate-700 text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Video Hero
                </Button>
            </div>
        </section>
    );
}
