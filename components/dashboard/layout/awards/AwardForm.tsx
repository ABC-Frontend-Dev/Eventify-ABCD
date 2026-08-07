"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Plus, Trash2, ChevronRight, ChevronDown, Eye, ImageIcon, X, Upload, GripVertical } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AwardImage {
    tempId: string;
    url: string;
    imageAlt: string;
    title: string;
    description: string;
    uploading?: boolean;
    expanded?: boolean;
}

interface AwardCategory {
    tempId: string;
    name: string;
    icon: string;
    iconAlt: string;
    images: AwardImage[];
    iconUploading?: boolean;
}

interface AwardFormProps {
    awardId?: number;
    mode: "create" | "edit";
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function FieldLabel({ children, required, ok, optional }: { children: React.ReactNode; required?: boolean; ok?: boolean; optional?: boolean }) {
    return (
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
            {children}
            {required && <span className="text-red-400">*</span>}
            {optional && <span className="text-[10px] text-slate-400 font-normal">(optional)</span>}
            {ok && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />}
        </label>
    );
}

const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

// ─── Tiny image upload helper ─────────────────────────────────────────────────

async function uploadToCloudinary(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    try {
        const res = await fetch("/api/upload?folder=awards", {
            method: "POST",
            body: fd,
        });
        const result = await res.json();
        return result.success ? result.path : null;
    } catch {
        return null;
    }
}

function validateAwardImage(file: File): string | null {
    const MB = file.size / (1024 * 1024);
    if (MB > 1) return `"${file.name}" is ${MB.toFixed(2)}MB — max 1MB allowed.`;
    if (!file.type.startsWith("image/")) return `"${file.name}" is not an image.`;
    return null;
}

// ─── AwardImageRow ────────────────────────────────────────────────────────────

function AwardImageRow({ image, index, onUpdate, onRemove }: { image: AwardImage; index: number; onUpdate: (patch: Partial<AwardImage>) => void; onRemove: () => void }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const toast = useToasts();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const err = validateAwardImage(file);
        if (err) {
            toast.error(err);
            return;
        }

        onUpdate({ uploading: true });
        const url = await uploadToCloudinary(file);
        if (url) {
            onUpdate({ url, uploading: false });
            toast.success("Image uploaded");
        } else {
            onUpdate({ uploading: false });
            toast.error("Upload failed — try again");
        }
        // reset input
        if (fileRef.current) fileRef.current.value = "";
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            {/* Accordion header */}
            <button type="button" onClick={() => onUpdate({ expanded: !image.expanded })} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />

                {/* Thumbnail */}
                <div className="h-9 w-9 rounded-md overflow-hidden border border-slate-100 bg-slate-50 shrink-0 flex items-center justify-center">
                    {image.url ? <img src={image.url} alt={image.imageAlt || "Award"} className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-slate-300" />}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{image.title || <span className="text-slate-400 font-normal">Award {index + 1} — add title</span>}</p>
                    {image.url && !image.title && <p className="text-[11px] text-emerald-500 mt-0.5">Image uploaded ✓</p>}
                    {!image.url && <p className="text-[11px] text-amber-500 mt-0.5">No image yet</p>}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {/* Status badges */}
                    {image.url && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">img ✓</span>}
                    {image.title && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">title ✓</span>}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="p-1.5 rounded-md text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors ml-1"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>

                    {image.expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
            </button>

            {/* Accordion body */}
            {image.expanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-4 bg-slate-50/40">
                    {/* Image upload */}
                    <div>
                        <FieldLabel required ok={!!image.url}>
                            Award Image
                        </FieldLabel>

                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                        {image.url ? (
                            <div className="flex items-start gap-3">
                                <div className="relative group h-24 w-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                                    <img src={image.url} alt={image.imageAlt || "Award image"} className="h-full w-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                        <button type="button" onClick={() => fileRef.current?.click()} className="text-[10px] bg-white text-slate-700 px-2 py-1 rounded font-medium hover:bg-slate-100">
                                            Replace
                                        </button>
                                        <button type="button" onClick={() => onUpdate({ url: "" })} className="text-[10px] bg-red-500 text-white px-2 py-1 rounded font-medium">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 text-[11px] text-slate-500 leading-relaxed">
                                    <p className="font-medium text-emerald-600 mb-1">✓ Image uploaded</p>
                                    <p>Hover image to replace or remove.</p>
                                    <p className="text-amber-600 mt-1">Max 1MB per image</p>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                disabled={image.uploading}
                                className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                {image.uploading ? (
                                    <>
                                        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                                        <span className="text-xs text-slate-400">Uploading…</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-6 w-6 text-slate-300" />
                                        <span className="text-xs text-slate-400">Click to upload image</span>
                                        <span className="text-[11px] text-amber-500 font-medium">Max 1MB</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Image Alt */}
                    <div>
                        <FieldLabel optional ok={!!image.imageAlt}>
                            Image Alt Text
                        </FieldLabel>
                        <Input value={image.imageAlt} onChange={(e) => onUpdate({ imageAlt: e.target.value })} placeholder="e.g. WOW Awards Middle East 2025 ceremony" className={inp} />
                    </div>

                    {/* Award Title */}
                    <div>
                        <FieldLabel required ok={!!image.title.trim()}>
                            Award Title
                        </FieldLabel>
                        <Input value={image.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="e.g. Best Event of the Year" className={inp} />
                    </div>

                    {/* Award Description */}
                    <div>
                        <FieldLabel optional ok={!!image.description.trim()}>
                            Award Description
                        </FieldLabel>
                        <Textarea
                            value={image.description}
                            onChange={(e) => onUpdate({ description: e.target.value })}
                            placeholder="e.g. Special Event Of The Year For Government / Federation / Association"
                            rows={3}
                            className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── AwardCategorySection ─────────────────────────────────────────────────────

function AwardCategorySection({ category, catIndex, onUpdate, onRemove }: { category: AwardCategory; catIndex: number; onUpdate: (patch: Partial<AwardCategory>) => void; onRemove: () => void }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const toast = useToasts();
    const [collapsed, setCollapsed] = useState(false);

    const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Category icon must be under 2MB");
            return;
        }

        onUpdate({ iconUploading: true });
        const url = await uploadToCloudinary(file);
        if (url) {
            onUpdate({ icon: url, iconUploading: false });
            toast.success("Category icon uploaded");
        } else {
            onUpdate({ iconUploading: false });
            toast.error("Icon upload failed");
        }
        if (fileRef.current) fileRef.current.value = "";
    };

    const addImage = () => {
        const newImage: AwardImage = {
            tempId: `img-${Date.now()}-${Math.random()}`,
            url: "",
            imageAlt: "",
            title: "",
            description: "",
            expanded: true,
        };
        onUpdate({ images: [...category.images, newImage] });
    };

    const updateImage = (tempId: string, patch: Partial<AwardImage>) => {
        onUpdate({
            images: category.images.map((img) => (img.tempId === tempId ? { ...img, ...patch } : img)),
        });
    };

    const removeImage = (tempId: string) => {
        onUpdate({
            images: category.images.filter((img) => img.tempId !== tempId),
        });
        toast.success("Award image removed");
    };

    const isValid = !!category.icon && category.images.length > 0 && category.images.every((img) => img.url && img.title.trim());

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Category header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <button type="button" onClick={() => setCollapsed((v) => !v)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    {/* Icon preview */}
                    <div className="h-9 w-9 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 flex items-center justify-center">
                        {category.icon ? (
                            <img src={category.icon} alt={category.iconAlt || "Category icon"} className="h-full w-full object-contain p-1" />
                        ) : (
                            <ImageIcon className="h-4 w-4 text-slate-300" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{category.iconAlt || category.name || <span className="text-slate-400 font-normal">Category {catIndex + 1}</span>}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            {category.images.length} image
                            {category.images.length !== 1 ? "s" : ""}
                            {isValid && <span className="ml-1.5 text-emerald-500">✓ complete</span>}
                        </p>
                    </div>

                    {collapsed ? <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </button>

                <button type="button" onClick={onRemove} className="p-1.5 rounded-md text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Category body */}
            {!collapsed && (
                <div className="p-4 space-y-5">
                    {/* Icon + Alt row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Icon upload */}
                        <div>
                            <FieldLabel required ok={!!category.icon}>
                                Category Tab Image (icon)
                            </FieldLabel>

                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />

                            {category.icon ? (
                                <div className="flex items-center gap-3">
                                    <div className="relative group h-12 w-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                                        <img src={category.icon} alt={category.iconAlt || "Icon"} className="h-full w-full object-contain p-1" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button type="button" onClick={() => fileRef.current?.click()} className="text-[10px] text-white underline">
                                                Replace
                                            </button>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => onUpdate({ icon: "" })} className="text-[11px] text-red-500 hover:underline">
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    disabled={category.iconUploading}
                                    className="w-full flex items-center justify-center gap-2 h-10 border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors text-xs text-slate-400 disabled:opacity-50"
                                >
                                    {category.iconUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading…
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            Upload tab icon
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Alt text = also used as the visual name */}
                        <div>
                            <FieldLabel required ok={!!category.iconAlt.trim()}>
                                Tab Image Title (alt text)
                            </FieldLabel>
                            <Input value={category.iconAlt} onChange={(e) => onUpdate({ iconAlt: e.target.value, name: e.target.value })} placeholder="e.g. WOW Awards Middle East" className={inp} />
                            <p className="mt-1 text-[11px] text-slate-400">Used as image alt &amp; category label</p>
                        </div>
                    </div>

                    {/* Award Images */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs font-semibold text-slate-700">Award Images</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Each image has a title + optional description · max 1MB per image</p>
                            </div>
                            <Button type="button" size="sm" onClick={addImage} className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white shrink-0">
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add Award Image
                            </Button>
                        </div>

                        {category.images.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                                <ImageIcon className="h-8 w-8 text-slate-200 mb-2" />
                                <p className="text-xs text-slate-400 mb-3">No award images yet</p>
                                <Button type="button" size="sm" onClick={addImage} variant="outline" className="h-7 text-xs">
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Add first image
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {category.images.map((image, imgIndex) => (
                                    <AwardImageRow
                                        key={image.tempId}
                                        image={image}
                                        index={imgIndex}
                                        onUpdate={(patch) => updateImage(image.tempId, patch)}
                                        onRemove={() => removeImage(image.tempId)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── AwardForm (main) ─────────────────────────────────────────────────────────

export default function AwardForm({ awardId, mode }: AwardFormProps) {
    const router = useRouter();
    const toast = useToasts();

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(mode === "edit");
    const [year, setYear] = useState(new Date().getFullYear());
    const [categories, setCategories] = useState<AwardCategory[]>([]);

    // Load existing data in edit mode
    useEffect(() => {
        if (mode !== "edit" || !awardId) return;

        fetch(`/api/awards/${awardId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success && data.data) {
                    setYear(data.data.year);
                    setCategories(
                        (data.data.categories || []).map(
                            (cat: {
                                id: number;
                                name: string;
                                icon: string;
                                iconAlt: string;
                                images: Array<{
                                    id: number;
                                    url: string;
                                    imageAlt: string;
                                    title: string;
                                    description: string;
                                }>;
                            }) => ({
                                tempId: `cat-${cat.id}`,
                                name: cat.name,
                                icon: cat.icon,
                                iconAlt: cat.iconAlt,
                                images: (cat.images || []).map((img: { id: number; url: string; imageAlt: string; title: string; description: string }) => ({
                                    tempId: `img-${img.id}`,
                                    url: img.url,
                                    imageAlt: img.imageAlt,
                                    title: img.title,
                                    description: img.description,
                                    expanded: false,
                                })),
                            }),
                        ),
                    );
                }
            })
            .catch(() => toast.error("Failed to load award data"))
            .finally(() => setFetchingData(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, awardId]);

    const addCategory = () => {
        setCategories((prev) => [
            ...prev,
            {
                tempId: `cat-${Date.now()}-${Math.random()}`,
                name: "",
                icon: "",
                iconAlt: "",
                images: [],
            },
        ]);
    };

    const updateCategory = (tempId: string, patch: Partial<AwardCategory>) => {
        setCategories((prev) => prev.map((cat) => (cat.tempId === tempId ? { ...cat, ...patch } : cat)));
    };

    const removeCategory = (tempId: string) => {
        const cat = categories.find((c) => c.tempId === tempId);
        toast.message({
            text: `Delete "${cat?.iconAlt || cat?.name || "this category"}"?`,
            preserve: true,
            action: "Delete",
            onAction: () => {
                setCategories((prev) => prev.filter((c) => c.tempId !== tempId));
                toast.success("Category removed");
            },
        });
    };

    // Validation
    const yearOk = year >= 2000 && year <= new Date().getFullYear() + 10;
    const categoriesOk = categories.length > 0 && categories.every((cat) => cat.icon && cat.iconAlt.trim() && cat.images.length > 0 && cat.images.every((img) => img.url && img.title.trim()));
    const isFormValid = yearOk && categoriesOk;

    const completionItems = [
        { label: "Year set", ok: yearOk },
        { label: "At least 1 category", ok: categories.length > 0 },
        {
            label: "All categories have icon",
            ok: categories.every((c) => !!c.icon),
        },
        {
            label: "All categories have images",
            ok: categories.every((c) => c.images.length > 0),
        },
        {
            label: "All images have titles",
            ok: categories.every((c) => c.images.every((img) => img.url && img.title.trim())),
        },
    ];
    const completionPct = Math.round((completionItems.filter((i) => i.ok).length / completionItems.length) * 100);

    const handleSubmit = async () => {
        if (!isFormValid) {
            toast.warning("Please complete all required fields");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                year,
                categories: categories.map((cat) => ({
                    name: cat.iconAlt || cat.name,
                    icon: cat.icon,
                    iconAlt: cat.iconAlt,
                    images: cat.images.map((img) => ({
                        url: img.url,
                        imageAlt: img.imageAlt,
                        title: img.title,
                        description: img.description,
                    })),
                })),
            };

            const res = await fetch(mode === "create" ? "/api/awards" : `/api/awards/${awardId}`, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (result.success) {
                toast.success(mode === "create" ? "Award created!" : "Award updated!");
                setTimeout(() => {
                    router.push("/dashboard/awards");
                    router.refresh();
                }, 800);
            } else {
                toast.error(result.error || "Failed to save award");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="min-h-screen bg-slate-50/60 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/60">
            {/* ── Sticky topbar ── */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="h-7 w-7 text-slate-500 hover:text-slate-900">
                        <Link href="/dashboard/awards">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>

                    <div className="h-4 w-px bg-slate-200" />

                    <span className="text-xs text-slate-400">Awards</span>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{mode === "create" ? "New Award Year" : `Edit ${year}`}</span>

                    <div className="hidden md:flex items-center gap-2 ml-3">
                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${completionPct}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-400">{completionPct}%</span>
                    </div>

                    <div className="flex-1" />

                    <Button type="button" variant="ghost" size="sm" onClick={() => router.back()} disabled={loading} className="h-7 text-xs text-slate-500 hover:text-slate-900 hidden sm:inline-flex">
                        Cancel
                    </Button>

                    <Button type="button" size="sm" onClick={handleSubmit} disabled={loading || !isFormValid} className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                        {mode === "create" ? "Create" : "Update"}
                    </Button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col xl:flex-row gap-5">
                {/* Main column */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* Year card */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Award Year</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        <div className="max-w-xs">
                            <FieldLabel required ok={yearOk}>
                                Year
                            </FieldLabel>
                            <Input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value) || 0)}
                                placeholder="e.g. 2025"
                                className={inp}
                                min={2000}
                                max={new Date().getFullYear() + 10}
                            />
                            <p className="mt-1 text-[11px] text-slate-400">Each year must be unique</p>
                        </div>
                    </section>

                    {/* Categories */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Award Categories</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>
                            <Button type="button" size="sm" onClick={addCategory} className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white ml-4 shrink-0">
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add Category
                            </Button>
                        </div>

                        {categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                                <ImageIcon className="h-10 w-10 text-slate-200 mb-3" />
                                <p className="text-xs font-medium text-slate-400 mb-1">No categories yet</p>
                                <p className="text-[11px] text-slate-300 mb-4 text-center max-w-xs">Add a category like &quot;WOW Awards&quot; or &quot;Middle East Awards&quot;</p>
                                <Button type="button" size="sm" onClick={addCategory} variant="outline" className="h-7 text-xs">
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Add first category
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {categories.map((cat, catIndex) => (
                                    <AwardCategorySection
                                        key={cat.tempId}
                                        category={cat}
                                        catIndex={catIndex}
                                        onUpdate={(patch) => updateCategory(cat.tempId, patch)}
                                        onRemove={() => removeCategory(cat.tempId)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Mobile save button */}
                    <div className="flex sm:hidden gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => router.back()} disabled={loading} className="flex-1 h-9 text-xs">
                            Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={handleSubmit} disabled={loading || !isFormValid} className="flex-1 h-9 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            {mode === "create" ? "Create" : "Update"}
                        </Button>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="w-full xl:w-64 shrink-0">
                    <div className="xl:sticky xl:top-[108px] space-y-4">
                        {/* Completion */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-600">Completion</span>
                                <span className="text-[11px] text-slate-400">
                                    {completionItems.filter((i) => i.ok).length}/{completionItems.length}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                                <div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${completionPct}%` }} />
                            </div>
                            <div className="space-y-2">
                                {completionItems.map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        {item.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 text-slate-200 shrink-0" />}
                                        <span className={`text-[11px] ${item.ok ? "text-slate-600" : "text-slate-400"}`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <span className="text-xs font-medium text-slate-600 block mb-3">How it works</span>
                            <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed">
                                <li className="flex items-start gap-1.5">
                                    <span className="text-slate-300 shrink-0 mt-0.5">1.</span>
                                    Set the award year (e.g. 2026)
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-slate-300 shrink-0 mt-0.5">2.</span>
                                    Add categories (WOW Awards, Middle East Awards…)
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-slate-300 shrink-0 mt-0.5">3.</span>
                                    Upload a tab icon + set its title for each category
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-slate-300 shrink-0 mt-0.5">4.</span>
                                    Add award images (max 1MB each) with title &amp; optional description
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-slate-300 shrink-0 mt-0.5">5.</span>
                                    Save — images persist to Cloudinary automatically
                                </li>
                            </ul>
                        </div>

                        {/* Category summary */}
                        {categories.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <span className="text-xs font-medium text-slate-600 block mb-3">Summary</span>
                                <div className="space-y-2">
                                    {categories.map((cat, i) => {
                                        const catValid = cat.icon && cat.iconAlt && cat.images.length > 0 && cat.images.every((img) => img.url && img.title);
                                        return (
                                            <div key={cat.tempId} className="flex items-center gap-2">
                                                {catValid ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] text-slate-600 truncate">{cat.iconAlt || `Category ${i + 1}`}</p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {cat.images.length} image
                                                        {cat.images.length !== 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
