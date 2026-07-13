// components/dashboard/layout/projects/ProjectForm.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Switch } from "@/components/ui/switch";
import { useToasts } from "@/components/ui/toast";
import { ArrowLeft, Save, Loader2, X, Image as ImageIcon, AlertCircle, CheckCircle2, Plus, Edit, Trash2, Layers, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────
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
        tabs: Array<{ id: number; name: string; images: string[]; order: number }>;
    };
    projectId?: number;
    mode: "create" | "edit";
}

// ── Shared micro-components ───────────────────────────────
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

// ── Main component ────────────────────────────────────────
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
    const [isTabModalOpen, setIsTabModalOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState<ProjectTab | null>(null);
    const [tabImageFiles, setTabImageFiles] = useState<File[]>([]);
    const [uploadingTabImages, setUploadingTabImages] = useState(false);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        bannerImage: initialData?.bannerImage || "",
        images: initialData?.images || [],
        categoryId: initialData?.categoryId || 0,
        hasTabs: initialData?.hasTabs || false,
    });

    const [tabs, setTabs] = useState<ProjectTab[]>(initialData?.tabs?.map((t) => ({ id: t.id, tempId: `tab-${t.id}`, name: t.name, images: t.images })) || []);

    // ── completion ────────────────────────────────────────
    const completion = useMemo(
        () => [
            { label: "Title", ok: !!formData.title.trim() },
            { label: "Description", ok: !!formData.description.trim() },
            { label: "Banner", ok: !!formData.bannerImage },
            { label: "Category", ok: formData.categoryId !== 0 },
            {
                label: formData.hasTabs ? "Tabs" : "Gallery",
                ok: formData.hasTabs ? tabs.length > 0 : formData.images.length > 0,
            },
        ],
        [formData, tabs],
    );

    const completionPct = Math.round((completion.filter((c) => c.ok).length / completion.length) * 100);
    const isFormValid = completion.every((c) => c.ok);

    // ── fetch categories ──────────────────────────────────
    useEffect(() => {
        fetch("/api/project-categories")
            .then((r) => r.json())
            .then((d) => {
                if (d.success) setCategories(d.data);
                else toast.error("Failed to load categories");
            })
            .catch(() => toast.error("Failed to load categories"))
            .finally(() => setLoadingCategories(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── edit mode load ────────────────────────────────────
    useEffect(() => {
        if (mode !== "edit" || !projectId) return;
        fetch(`/api/projects/${projectId}`)
            .then((r) => r.json())
            .then((data) => {
                if (!data.success) return toast.error("Failed to load project data");
                const d = data.data;
                setFormData({
                    title: d.title,
                    description: d.description,
                    bannerImage: d.bannerImage,
                    images: d.images || [],
                    categoryId: d.categoryId,
                    hasTabs: d.hasTabs || false,
                });
                if (d.tabs?.length) {
                    setTabs(d.tabs.map((t: any) => ({ id: t.id, tempId: `tab-${t.id}`, name: t.name, images: t.images })));
                }
            })
            .catch(() => toast.error("Failed to load project data"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, projectId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: name === "categoryId" ? parseInt(value) : value }));
    };

    // ── upload helpers ────────────────────────────────────
    const uploadFile = async (file: File): Promise<string | null> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const result = await res.json();
        return result.success ? result.path : null;
    };

    const handleBannerUpload = async (files: File[]) => {
        if (!files.length) return;
        setUploadingBanner(true);
        const path = await uploadFile(files[0]).catch(() => null);
        setUploadingBanner(false);
        if (path) {
            setFormData((p) => ({ ...p, bannerImage: path }));
            toast.success("Banner uploaded");
        } else toast.error("Failed to upload banner");
    };

    const handleGalleryUpload = async (files: File[]) => {
        if (!files.length) return;
        setUploadingImages(true);
        const paths = (await Promise.all(files.map(uploadFile))).filter(Boolean) as string[];
        setUploadingImages(false);
        setGalleryFiles([]);
        if (paths.length) {
            setFormData((p) => ({ ...p, images: [...p.images, ...paths] }));
            toast.success(`${paths.length} image(s) uploaded`);
        }
        if (paths.length < files.length) toast.warning("Some images failed to upload");
    };

    const handleTabImageUpload = async (files: File[]) => {
        if (!files.length || !currentTab) return;
        setUploadingTabImages(true);
        const paths = (await Promise.all(files.map(uploadFile))).filter(Boolean) as string[];
        setUploadingTabImages(false);
        setTabImageFiles([]);
        if (paths.length) {
            setCurrentTab((t) => (t ? { ...t, images: [...t.images, ...paths] } : t));
            toast.success(`${paths.length} image(s) uploaded`);
        }
    };

    // ── tab management ────────────────────────────────────
    const openAddTab = () => {
        setCurrentTab({ tempId: `temp-${Date.now()}`, name: "", images: [] });
        setIsTabModalOpen(true);
    };
    const openEditTab = (t: ProjectTab) => {
        setCurrentTab({ ...t });
        setIsTabModalOpen(true);
    };
    const closeModal = () => {
        setIsTabModalOpen(false);
        setCurrentTab(null);
        setTabImageFiles([]);
    };

    const handleDeleteTab = (tempId: string) => {
        setTabs((ts) => ts.filter((t) => t.tempId !== tempId));
        toast.success("Tab deleted");
    };

    const handleSaveTab = () => {
        if (!currentTab?.name.trim()) {
            toast.warning("Tab name is required");
            return;
        }
        if (!currentTab.images.length) {
            toast.warning("Add at least one image");
            return;
        }
        const idx = tabs.findIndex((t) => t.tempId === currentTab.tempId);
        if (idx >= 0) {
            const ts = [...tabs];
            ts[idx] = currentTab;
            setTabs(ts);
            toast.success("Tab updated");
        } else {
            setTabs((ts) => [...ts, currentTab]);
            toast.success("Tab added");
        }
        closeModal();
    };

    // ── submit ────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.warning("Please complete all required fields");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(mode === "create" ? "/api/projects" : `/api/projects/${projectId}`, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    tabs: formData.hasTabs ? tabs.map(({ name, images }) => ({ name, images })) : undefined,
                }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success(mode === "create" ? "Project created!" : "Project updated!");
                setTimeout(() => {
                    router.push("/dashboard/projects");
                    router.refresh();
                }, 800);
            } else toast.error(result.message || result.error || "Failed to save project");
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── shared styles ─────────────────────────────────────
    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";
    const sel = "w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-400 text-slate-700 disabled:opacity-50";

    return (
        <div className="min-h-screen bg-slate-50/60">
            {/* ── sticky topbar ─────────────────────────── */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="h-7 w-7 text-slate-500 hover:text-slate-900">
                        <Link href="/dashboard/projects">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>

                    <div className="h-4 w-px bg-slate-200" />

                    <span className="text-xs text-slate-400">Projects</span>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{mode === "create" ? "New project" : formData.title || "Edit project"}</span>

                    {/* progress */}
                    <div className="hidden md:flex items-center gap-2 ml-3">
                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${completionPct}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-400">{completionPct}%</span>
                    </div>

                    <div className="flex-1" />

                    <Button
                        type="submit"
                        form="project-form"
                        size="sm"
                        disabled={loading || uploadingBanner || uploadingImages || !isFormValid}
                        className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                    >
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                        {mode === "create" ? "Create" : "Update"}
                    </Button>
                </div>
            </div>

            {/* ── body ──────────────────────────────────── */}
            <form id="project-form" onSubmit={handleSubmit} className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col xl:flex-row gap-5">
                {/* ── main column ───────────────────────── */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* BASIC INFO */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Basic Info" />
                        <div className="space-y-4">
                            {/* title */}
                            <div>
                                <FieldLabel required ok={!!formData.title}>
                                    Project Title
                                </FieldLabel>
                                <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Annual Tech Conference 2024" className={inp} />
                            </div>

                            {/* category */}
                            <div>
                                <FieldLabel required ok={formData.categoryId !== 0}>
                                    Category
                                </FieldLabel>
                                <select name="categoryId" value={formData.categoryId} onChange={handleChange} className={sel} disabled={loadingCategories}>
                                    <option value={0}>{loadingCategories ? "Loading…" : "Select category…"}</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
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
                                    placeholder="Provide a detailed description of the project…"
                                    rows={5}
                                    className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                                />
                                <p className="mt-1 text-[11px] text-slate-400 text-right">{formData.description.length} chars</p>
                            </div>
                        </div>
                    </section>

                    {/* BANNER */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Banner Image" />

                        <ImageUploader
                            files={bannerFiles}
                            onChange={(f) => {
                                setBannerFiles(f);
                                handleBannerUpload(f);
                            }}
                            maxFiles={1}
                            maxSize={10}
                            accept="image/*,video/*"
                        />

                        {uploadingBanner && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading banner…
                            </div>
                        )}

                        {formData.bannerImage && !uploadingBanner && (
                            <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100">
                                <img src={formData.bannerImage} alt="Banner" className="w-full h-40 object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData((p) => ({ ...p, bannerImage: "" }));
                                        setBannerFiles([]);
                                    }}
                                    className="absolute top-2 right-2 p-1 rounded-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </section>

                    {/* TABS TOGGLE */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-700">Enable Tabs</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Organise images into categorised tabs</p>
                            </div>
                            <Switch
                                checked={formData.hasTabs}
                                onCheckedChange={(checked) => {
                                    setFormData((p) => ({ ...p, hasTabs: checked }));
                                    if (!checked) setTabs([]);
                                }}
                            />
                        </div>
                    </section>

                    {/* TABS or GALLERY */}
                    {formData.hasTabs ? (
                        <section className="bg-white border border-slate-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Tabs</span>
                                    <div className="h-px bg-slate-100 w-16" />
                                </div>
                                <Button type="button" size="sm" onClick={openAddTab} className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Tab
                                </Button>
                            </div>

                            {tabs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-lg">
                                    <Layers className="h-8 w-8 text-slate-200 mb-2" />
                                    <p className="text-xs text-slate-400">No tabs yet — click Add Tab to start</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {tabs.map((tab) => (
                                        <div key={tab.tempId} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                                                    <Layers className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-800">{tab.name}</p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {tab.images.length} image{tab.images.length !== 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditTab(tab)}
                                                    className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteTab(tab.tempId)}
                                                    className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ) : (
                        <section className="bg-white border border-slate-200 rounded-xl p-5">
                            <SectionHeading label="Project Gallery" />

                            <ImageUploader
                                files={galleryFiles}
                                onChange={(f) => {
                                    setGalleryFiles(f);
                                    handleGalleryUpload(f);
                                }}
                                maxFiles={10 - formData.images.length}
                                maxSize={10}
                                accept="image/*,video/*"
                            />

                            {uploadingImages && (
                                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                                </div>
                            )}

                            {formData.images.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] text-slate-400">{formData.images.length}/10 images</span>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {formData.images.map((img, i) => (
                                            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-100">
                                                <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                                                        className="p-1 rounded-md bg-white/90 text-red-500 shadow"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <span className="absolute top-1 left-1 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded-full">{i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {formData.images.length === 0 && !uploadingImages && (
                                <div className="flex flex-col items-center justify-center py-8 mt-3 border-2 border-dashed border-slate-100 rounded-lg">
                                    <ImageIcon className="h-8 w-8 text-slate-200 mb-2" />
                                    <p className="text-xs text-slate-400">No images yet — upload at least one</p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* mobile footer */}
                    <div className="flex sm:hidden gap-2">
                        <Button
                            type="submit"
                            form="project-form"
                            size="sm"
                            disabled={loading || uploadingBanner || uploadingImages || !isFormValid}
                            className="flex-1 h-9 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                        >
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                            {mode === "create" ? "Create" : "Update"}
                        </Button>
                    </div>
                </div>

                {/* ── sidebar ───────────────────────────── */}
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
                                        {item.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 text-slate-200  shrink-0" />}
                                        <span className={`text-[11px] ${item.ok ? "text-slate-600" : "text-slate-400"}`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* tips */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <span className="text-xs font-medium text-slate-600 block mb-3">Tips</span>
                            <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                                <li>Banner: 1200×630 works great for all viewports.</li>
                                <li>Use tabs to split images by room, area, or phase.</li>
                                <li>Keep gallery images under 1 MB each for fast load.</li>
                                <li>Short, clear descriptions improve SEO.</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </form>

            {/* ── Tab Modal ─────────────────────────────── */}
            {isTabModalOpen && currentTab && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                        {/* modal header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{tabs.find((t) => t.tempId === currentTab.tempId) ? "Edit Tab" : "Add Tab"}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Name this section and upload its images</p>
                            </div>
                            <button type="button" onClick={closeModal} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* modal body */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                            {/* tab name */}
                            <div>
                                <FieldLabel required ok={!!currentTab.name.trim()}>
                                    Tab Name
                                </FieldLabel>
                                <Input
                                    value={currentTab.name}
                                    onChange={(e) => setCurrentTab((t) => (t ? { ...t, name: e.target.value } : t))}
                                    placeholder="e.g. Interior, Exterior, Stage Setup…"
                                    className="h-9 text-sm border-slate-200 focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                                />
                            </div>

                            {/* tab images */}
                            <div>
                                <FieldLabel required ok={currentTab.images.length > 0}>
                                    Images ({currentTab.images.length})
                                </FieldLabel>

                                <ImageUploader
                                    files={tabImageFiles}
                                    onChange={(f) => {
                                        setTabImageFiles(f);
                                        handleTabImageUpload(f);
                                    }}
                                    maxFiles={20 - currentTab.images.length}
                                    maxSize={4}
                                    accept="image/*"
                                />

                                {uploadingTabImages && (
                                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                                    </div>
                                )}

                                {currentTab.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        {currentTab.images.map((img, i) => (
                                            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-100">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentTab((t) => (t ? { ...t, images: t.images.filter((_, idx) => idx !== i) } : t))}
                                                        className="p-1 rounded-md bg-white/90 text-red-500 shadow"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <span className="absolute top-1 left-1 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded-full">{i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* modal footer */}
                        <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 shrink-0">
                            <Button
                                type="button"
                                onClick={handleSaveTab}
                                disabled={!currentTab.name.trim() || !currentTab.images.length}
                                size="sm"
                                className="flex-1 h-8 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                            >
                                <Save className="h-3.5 w-3.5 mr-1.5" /> Save Tab
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={closeModal} className="h-8 text-xs">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
