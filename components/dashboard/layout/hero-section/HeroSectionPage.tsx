"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Loader2, CheckCircle2, Trash2, Star, Video, ImageIcon, Eye, EyeOff, RefreshCw, Play, MonitorPlay, GalleryHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToasts } from "@/components/ui/toast";
import { ImageUploader } from "@/components/ui/image-uploader";
import DashboardHeader from "../common/Header";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroImage {
    id: number;
    imageUrl: string;
    altText: string | null;
    title: string | null;
    description: string | null;
    isActive: boolean;
    order: number;
}

interface HeroSection {
    id: number;
    mediaType: "video" | "image";
    videoUrl: string | null;
    videoTitle: string | null;
    videoDesc: string | null;
    images: HeroImage[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_IMAGE_SIZE_MB = 5; // raised — 1 MB was too tight for most photos
const MAX_VIDEO_SIZE_MB = 100; // streaming handles it now

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionHeading({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );
}

function Badge({ children, color = "slate" }: { children: React.ReactNode; color?: "slate" | "emerald" | "amber" | "blue" }) {
    const colors = {
        slate: "bg-slate-100 text-slate-600",
        emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        amber: "bg-amber-50 text-amber-700 border border-amber-200",
        blue: "bg-blue-50 text-blue-700 border border-blue-200",
    };
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[color]}`}>{children}</span>;
}

// ─── Live Preview Card ────────────────────────────────────────────────────────

function LivePreviewCard({ hero }: { hero: HeroSection }) {
    const activeImage = hero.images.find((img) => img.isActive);
    const isVideo = hero.mediaType === "video";

    return (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-700">Currently Live</span>
                </div>
                <Badge color={isVideo ? "blue" : "emerald"}>
                    {isVideo ? (
                        <>
                            <Video className="h-3 w-3" /> Video Mode
                        </>
                    ) : (
                        <>
                            <ImageIcon className="h-3 w-3" /> Image Mode
                        </>
                    )}
                </Badge>
            </div>

            {/* Preview area */}
            <div className="p-5">
                {isVideo ? (
                    hero.videoUrl ? (
                        <div className="space-y-3">
                            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                                <video src={hero.videoUrl} className="w-full h-full object-cover" controls muted playsInline />
                                <div className="absolute top-2 left-2">
                                    <Badge color="blue">
                                        <Play className="h-3 w-3" /> Live Video
                                    </Badge>
                                </div>
                            </div>
                            {(hero.videoTitle || hero.videoDesc) && (
                                <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-1">
                                    {hero.videoTitle && <p className="text-sm font-semibold text-slate-700">{hero.videoTitle}</p>}
                                    {hero.videoDesc && <p className="text-xs text-slate-500 leading-relaxed">{hero.videoDesc}</p>}
                                </div>
                            )}
                        </div>
                    ) : (
                        <EmptyPreview icon={<MonitorPlay className="h-8 w-8 text-slate-300" />} message="No video uploaded yet" hint="Upload a video below and click Save Video Settings" />
                    )
                ) : activeImage ? (
                    <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden bg-slate-100 aspect-video">
                            <Image src={activeImage.imageUrl} alt={activeImage.altText || activeImage.title || "Hero image"} fill className="object-cover" />
                            <div className="absolute top-2 left-2">
                                <Badge color="emerald">
                                    <CheckCircle2 className="h-3 w-3" /> Active Image
                                </Badge>
                            </div>
                        </div>
                        {(activeImage.title || activeImage.description) && (
                            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-1">
                                {activeImage.title && <p className="text-sm font-semibold text-slate-700">{activeImage.title}</p>}
                                {activeImage.description && <p className="text-xs text-slate-500 leading-relaxed">{activeImage.description}</p>}
                            </div>
                        )}
                    </div>
                ) : hero.images.length > 0 ? (
                    <EmptyPreview
                        icon={<GalleryHorizontal className="h-8 w-8 text-slate-300" />}
                        message={`${hero.images.length} image${hero.images.length > 1 ? "s" : ""} uploaded — none set as active`}
                        hint="Set one of the images below as active so it shows on the site"
                    />
                ) : (
                    <EmptyPreview icon={<GalleryHorizontal className="h-8 w-8 text-slate-300" />} message="No images added yet" hint="Add images in the Image Panel below" />
                )}
            </div>
        </section>
    );
}

function EmptyPreview({ icon, message, hint }: { icon: React.ReactNode; message: string; hint: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-10 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-center px-4">
            {icon}
            <p className="text-sm font-medium text-slate-500">{message}</p>
            <p className="text-xs text-slate-400">{hint}</p>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HeroSectionPage() {
    const toast = useToasts();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hero, setHero] = useState<HeroSection | null>(null);
    const [mediaType, setMediaType] = useState<"video" | "image">("video");

    // Video panel
    const [videoUrl, setVideoUrl] = useState("");
    const [videoTitle, setVideoTitle] = useState("");
    const [videoDesc, setVideoDesc] = useState("");
    const [videoUploading, setVideoUploading] = useState(false);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [savingVideo, setSavingVideo] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);

    // New image form
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [newImageUrl, setNewImageUrl] = useState("");
    const [newImageAlt, setNewImageAlt] = useState("");
    const [newImageTitle, setNewImageTitle] = useState("");
    const [newImageDesc, setNewImageDesc] = useState("");
    const [imageUploading, setImageUploading] = useState(false);
    const [addingImage, setAddingImage] = useState(false);

    const [savingMode, setSavingMode] = useState(false);

    // ── Data fetching ─────────────────────────────────────────────────────────

    const fetchHero = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setRefreshing(true);
        try {
            const res = await axios.get("/api/hero-section");
            if (res.data.success) {
                const data: HeroSection = res.data.data;
                setHero(data);
                setMediaType(data.mediaType);
                setVideoUrl(data.videoUrl ?? "");
                setVideoTitle(data.videoTitle ?? "");
                setVideoDesc(data.videoDesc ?? "");
            }
        } catch {
            toast.error("Failed to load hero section");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHero();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Video upload ──────────────────────────────────────────────────────────

    const handleVideoUpload = async (files: File[]) => {
        if (!files.length) return;
        const file = files[0];

        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
            toast.error(`Video exceeds ${MAX_VIDEO_SIZE_MB}MB limit.`);
            setVideoFiles([]);
            return;
        }

        setVideoUploading(true);
        setVideoUploadProgress(0);

        try {
            const fd = new FormData();
            fd.append("file", file);

            // Use XMLHttpRequest so we can track upload progress
            const url = await new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener("progress", (e) => {
                    if (e.lengthComputable) {
                        setVideoUploadProgress(Math.round((e.loaded / e.total) * 100));
                    }
                });

                xhr.addEventListener("load", () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const result = JSON.parse(xhr.responseText);
                        if (result.success) resolve(result.path);
                        else reject(new Error(result.error || "Upload failed"));
                    } else {
                        reject(new Error("Upload failed"));
                    }
                });

                xhr.addEventListener("error", () => reject(new Error("Network error")));
                xhr.open("POST", "/api/upload?folder=hero");
                xhr.send(fd);
            });

            setVideoUrl(url);
            toast.success("Video uploaded — click Save Video Settings to go live");
        } catch (err: any) {
            toast.error(err?.message || "Failed to upload video");
            setVideoFiles([]);
        } finally {
            setVideoUploading(false);
            setVideoUploadProgress(0);
        }
    };

    const handleSaveVideo = async () => {
        if (!videoUrl) {
            toast.warning("Please upload a video first");
            return;
        }
        setSavingVideo(true);
        try {
            const res = await axios.put("/api/hero-section", {
                mediaType: "video",
                videoUrl,
                videoTitle,
                videoDesc,
            });
            if (res.data.success) {
                toast.success("Hero video saved and set live");
                setHero(res.data.data);
                setMediaType("video");
            } else {
                toast.error(res.data.error || "Failed to save video");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to save video");
        } finally {
            setSavingVideo(false);
        }
    };

    // ── Image upload ──────────────────────────────────────────────────────────

    const handleNewImageUpload = async (files: File[]) => {
        if (!files.length) return;
        const file = files[0];

        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            toast.error(`Image exceeds ${MAX_IMAGE_SIZE_MB}MB limit.`);
            setNewImageFiles([]);
            return;
        }

        setImageUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload?folder=hero", { method: "POST", body: fd });
            const result = await res.json();

            if (result.success) {
                setNewImageUrl(result.path);
                toast.success("Image uploaded — fill in details and click Add Image");
            } else {
                toast.error(result.error || "Failed to upload image");
                setNewImageFiles([]);
            }
        } catch {
            toast.error("Failed to upload image");
            setNewImageFiles([]);
        } finally {
            setImageUploading(false);
        }
    };

    const handleAddImage = async () => {
        if (!newImageUrl) {
            toast.warning("Please upload an image first");
            return;
        }
        setAddingImage(true);
        try {
            const res = await axios.post("/api/hero-section/images", {
                imageUrl: newImageUrl,
                altText: newImageAlt,
                title: newImageTitle,
                description: newImageDesc,
            });
            if (res.data.success) {
                toast.success("Image added to hero gallery");
                setNewImageUrl("");
                setNewImageAlt("");
                setNewImageTitle("");
                setNewImageDesc("");
                setNewImageFiles([]);
                fetchHero(true);
            } else {
                toast.error(res.data.error || "Failed to add image");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to add image");
        } finally {
            setAddingImage(false);
        }
    };

    // ── Image management ──────────────────────────────────────────────────────

    const handleSetActiveImage = async (imageId: number) => {
        try {
            const res = await axios.put(`/api/hero-section/images/${imageId}`, { isActive: true });
            if (res.data.success) {
                toast.success("Active image updated");
                fetchHero(true);
            } else {
                toast.error(res.data.error || "Failed to set active image");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to set active image");
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        toast.message({
            text: "Delete this hero image?",
            preserve: true,
            action: "Delete",
            onAction: async () => {
                try {
                    const res = await axios.delete(`/api/hero-section/images/${imageId}`);
                    if (res.data.success) {
                        toast.success("Image deleted");
                        fetchHero(true);
                    } else {
                        toast.error(res.data.error || "Failed to delete image");
                    }
                } catch {
                    toast.error("Failed to delete image");
                }
            },
        });
    };

    // ── Mode switch ───────────────────────────────────────────────────────────

    const handleSwitchMode = async (mode: "video" | "image") => {
        if (mode === mediaType) return;

        if (mode === "video" && !videoUrl && !hero?.videoUrl) {
            toast.warning("Upload and save a video before switching to video mode");
            return;
        }

        setSavingMode(true);
        try {
            const res = await axios.put("/api/hero-section", {
                mediaType: mode,
                ...(mode === "video" ? { videoUrl: videoUrl || hero?.videoUrl, videoTitle, videoDesc } : {}),
            });
            if (res.data.success) {
                setMediaType(mode);
                setHero(res.data.data);
                toast.success(`Hero section switched to ${mode} mode`);
            } else {
                toast.error(res.data.error || "Failed to switch mode");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to switch mode");
        } finally {
            setSavingMode(false);
        }
    };

    // ── Shared styles ─────────────────────────────────────────────────────────

    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
                <DashboardHeader title="Hero Section" description="Manage the homepage hero — switch between a fullscreen video or an image carousel." />
                <Button variant="outline" size="sm" onClick={() => fetchHero(true)} disabled={refreshing} className="h-8 text-xs gap-1.5 shrink-0 mt-1">
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* ── 1. LIVE PREVIEW ───────────────────────────────────────────── */}
            {hero && <LivePreviewCard hero={hero} />}

            {/* ── 2. MODE TOGGLE ────────────────────────────────────────────── */}
            <section className="bg-white border border-slate-200 rounded-xl p-5">
                <SectionHeading label="Live Media Type" />
                <div className="flex gap-2 max-w-xs">
                    <button
                        type="button"
                        disabled={savingMode}
                        onClick={() => handleSwitchMode("video")}
                        className={`flex-1 h-10 text-sm rounded-md border transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                            mediaType === "video" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                    >
                        {savingMode && mediaType !== "video" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
                        Video
                    </button>
                    <button
                        type="button"
                        disabled={savingMode}
                        onClick={() => handleSwitchMode("image")}
                        className={`flex-1 h-10 text-sm rounded-md border transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                            mediaType === "image" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                    >
                        {savingMode && mediaType !== "image" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                        Image
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">The selected mode is what visitors currently see on the homepage.</p>
            </section>

            {/* ── 3. VIDEO PANEL ────────────────────────────────────────────── */}
            <section className="bg-white border border-slate-200 rounded-xl p-5">
                <SectionHeading label={`Hero Video (max ${MAX_VIDEO_SIZE_MB}MB · mp4 / webm)`} />

                <ImageUploader
                    files={videoFiles}
                    onChange={(f) => {
                        setVideoFiles(f);
                        handleVideoUpload(f);
                    }}
                    maxFiles={1}
                    maxSize={MAX_VIDEO_SIZE_MB}
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                />

                {/* Upload progress */}
                {videoUploading && (
                    <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Uploading to Cloudinary…
                            </span>
                            <span>{videoUploadProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-200 rounded-full" style={{ width: `${videoUploadProgress}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-400">Large videos may take up to 2 minutes — please don't close the tab.</p>
                    </div>
                )}

                {/* Video preview — shows both newly uploaded AND saved video from DB */}
                {videoUrl && !videoUploading && (
                    <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-600">Video Preview</span>
                            {hero?.videoUrl === videoUrl && (
                                <Badge color="emerald">
                                    <CheckCircle2 className="h-3 w-3" /> Saved &amp; Live
                                </Badge>
                            )}
                            {hero?.videoUrl !== videoUrl && (
                                <Badge color="amber">
                                    <Eye className="h-3 w-3" /> Uploaded — not saved yet
                                </Badge>
                            )}
                        </div>
                        <div className="rounded-lg overflow-hidden border border-slate-200 bg-black">
                            <video src={videoUrl} className="w-full max-h-72 object-contain" controls muted playsInline />
                        </div>
                    </div>
                )}

                {/* Video metadata */}
                <div className="mt-4 space-y-3">
                    <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Overlay Title (optional)</Label>
                        <Input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="e.g. Turning Moments Into Spectacular Experiences" className={inp} />
                    </div>
                    <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Overlay Description (optional)</Label>
                        <Textarea
                            value={videoDesc}
                            onChange={(e) => setVideoDesc(e.target.value)}
                            placeholder="e.g. We transform ideas into world-class events…"
                            rows={3}
                            className="text-sm border-slate-200"
                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <Button onClick={handleSaveVideo} disabled={savingVideo || videoUploading || !videoUrl} className="bg-slate-900 hover:bg-slate-700 text-white">
                        {savingVideo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        Save Video Settings
                    </Button>

                    {videoUrl && hero?.videoUrl !== videoUrl && !videoUploading && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                            <EyeOff className="h-3.5 w-3.5" />
                            Video uploaded but not saved yet
                        </p>
                    )}
                </div>
            </section>

            {/* ── 4. IMAGE PANEL ────────────────────────────────────────────── */}
            <section className="bg-white border border-slate-200 rounded-xl p-5">
                <SectionHeading label={`Hero Images (max ${MAX_IMAGE_SIZE_MB}MB · jpg / png / webp)`} />

                {/* Existing images grid */}
                {hero && hero.images.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                        {hero.images.map((img) => (
                            <ImageCard key={img.id} img={img} onSetActive={handleSetActiveImage} onDelete={handleDeleteImage} />
                        ))}
                    </div>
                ) : (
                    <div className="mb-6 flex flex-col items-center justify-center py-10 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                        <GalleryHorizontal className="h-8 w-8 text-slate-300 mb-2" />
                        <p className="text-sm text-slate-400">No hero images yet — add one below</p>
                    </div>
                )}

                {/* Add new image */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Add New Image</p>

                    <ImageUploader
                        files={newImageFiles}
                        onChange={(f) => {
                            setNewImageFiles(f);
                            handleNewImageUpload(f);
                        }}
                        maxFiles={1}
                        maxSize={MAX_IMAGE_SIZE_MB}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                    />

                    {imageUploading && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading image…
                        </div>
                    )}

                    {/* Uploaded image preview */}
                    {newImageUrl && !imageUploading && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-600">Preview</span>
                                <Badge color="amber">
                                    <Eye className="h-3 w-3" /> Not saved yet
                                </Badge>
                            </div>
                            <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                                <Image src={newImageUrl} alt="New hero image preview" fill className="object-cover" />
                            </div>
                        </div>
                    )}

                    {/* Metadata form */}
                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Alt Text (optional — good for SEO)</Label>
                            <Input value={newImageAlt} onChange={(e) => setNewImageAlt(e.target.value)} placeholder="e.g. Eventify Entertainment hero image" className={inp} />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Title (optional)</Label>
                            <Input value={newImageTitle} onChange={(e) => setNewImageTitle(e.target.value)} placeholder="e.g. Turning Moments Into Spectacular Experiences" className={inp} />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Description (optional)</Label>
                            <Textarea
                                value={newImageDesc}
                                onChange={(e) => setNewImageDesc(e.target.value)}
                                placeholder="e.g. We transform ideas into world-class events…"
                                rows={3}
                                className="text-sm border-slate-200"
                            />
                        </div>
                    </div>

                    <Button onClick={handleAddImage} disabled={addingImage || imageUploading || !newImageUrl} className="bg-slate-900 hover:bg-slate-700 text-white">
                        {addingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        Add Image to Hero Gallery
                    </Button>
                </div>
            </section>
        </div>
    );
}

// ─── Image Card ───────────────────────────────────────────────────────────────

function ImageCard({ img, onSetActive, onDelete }: { img: HeroImage; onSetActive: (id: number) => void; onDelete: (id: number) => void }) {
    return (
        <div className={`relative rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${img.isActive ? "border-emerald-400 ring-1 ring-emerald-300 shadow-sm" : "border-slate-200"}`}>
            {/* Image */}
            <div className="relative aspect-video bg-slate-100">
                <Image src={img.imageUrl} alt={img.altText || img.title || "Hero image"} fill className="object-cover" />
                {img.isActive && <div className="absolute inset-0 bg-emerald-500/5" />}
                {/* Active badge */}
                {img.isActive && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-emerald-500 text-white text-[10px] px-2 py-0.5 font-medium shadow">
                        <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                )}
                {/* Order badge */}
                <span className="absolute top-2 right-2 rounded-full bg-black/40 text-white text-[10px] px-1.5 py-0.5">#{img.order + 1}</span>
            </div>

            {/* Info */}
            <div className="p-3 space-y-1">
                <p className="text-sm font-medium text-slate-700 truncate">{img.title || "Untitled"}</p>
                {img.altText && <p className="text-xs text-slate-400 truncate">{img.altText}</p>}
                {img.description && <p className="text-xs text-slate-400 truncate">{img.description}</p>}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                    {!img.isActive && (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs flex-1 border-slate-200 hover:border-emerald-400 hover:text-emerald-600"
                            onClick={() => onSetActive(img.id)}
                        >
                            <Star className="h-3 w-3 mr-1" />
                            Set Active
                        </Button>
                    )}
                    {img.isActive && (
                        <span className="flex-1 text-[11px] text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Currently active
                        </span>
                    )}
                    <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => onDelete(img.id)} title="Delete image">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
