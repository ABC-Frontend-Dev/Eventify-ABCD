// components/dashboard/layout/about-us
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToasts } from "@/components/ui/toast";
import {
    Loader2, X, AlertCircle, CheckCircle2, Eye, RefreshCw,
    Plus, Trash2, Pencil, ChevronDown, ChevronUp,
    FileText, Image as ImageIcon, LayoutGrid,
} from "lucide-react";
import Image from "next/image";
import DashboardHeader from "../common/Header";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_IMAGE_SIZE_MB = 2;
const MAX_CARDS = 3;

// ─── Types ────────────────────────────────────────────────────────────────────

interface AboutUsCard {
    id?: number;
    frontFacePartOne: string;   // required
    frontFacePartTwo: string;   // optional but string for controlled input
    backFace: string;
    sortOrder: number;
}

interface AboutUsData {
    id?: number;
    titlePartOne: string;
    titlePartTwo: string;
    description: string;
    image: string;
    imageAlt: string;
    cards: AboutUsCard[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldLabel({
    children,
    required,
    ok,
}: {
    children: React.ReactNode;
    required?: boolean;
    ok?: boolean;
}) {
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
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                {label}
            </span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );
}

// ─── Current Data Preview ─────────────────────────────────────────────────────

function CurrentDataPreview({ data }: { data: AboutUsData }) {
    return (
        <div className="space-y-4">
            {/* Title + Description */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Heading & Description
                    </span>
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="text-[11px] text-slate-400 mb-1">Title</p>
                        <p className="text-lg font-bold text-footer-bg normal-case leading-tight">
                            {data.titlePartOne || (
                                <span className="text-slate-300 font-normal text-sm">
                                    No title set
                                </span>
                            )}
                            {data.titlePartTwo && (
                                <>
                                    {" "}
                                    <span className="font-abc-laica-a-italic-variable-trial text-primary">
                                        {data.titlePartTwo}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div>
                        <p className="text-[11px] text-slate-400 mb-1">Description</p>
                        {data.description ? (
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                                {data.description}
                            </p>
                        ) : (
                            <p className="text-sm text-slate-300">No description set</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Image + Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                            Section Image
                        </span>
                    </div>

                    {data.image ? (
                        <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-100">
                            <Image
                                src={data.image}
                                alt={data.imageAlt || "About Us image"}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-44 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <div className="text-center">
                                <ImageIcon className="h-6 w-6 text-slate-200 mx-auto mb-1.5" />
                                <p className="text-xs text-slate-300">No image uploaded</p>
                            </div>
                        </div>
                    )}

                    {data.imageAlt && (
                        <p className="mt-2 text-[11px] text-slate-400 truncate">
                            Alt:{" "}
                            <span className="text-slate-500">{data.imageAlt}</span>
                        </p>
                    )}
                </div>

                {/* Cards */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <LayoutGrid className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                            Flip Cards ({data.cards.length}/{MAX_CARDS})
                        </span>
                    </div>

                    {data.cards.length === 0 ? (
                        <div className="w-full h-44 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <div className="text-center">
                                <LayoutGrid className="h-6 w-6 text-slate-200 mx-auto mb-1.5" />
                                <p className="text-xs text-slate-300">No cards added</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {data.cards.map((card, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                                >
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 shrink-0 w-10">
                                        Card {i + 1}
                                    </span>
                                    <div className="min-w-0">
                                        {/* ✅ Fixed: use frontFacePartOne / frontFacePartTwo */}
                                        <p className="text-xs font-medium text-slate-700 truncate">
                                            {card.frontFacePartOne || card.frontFacePartTwo ? (
                                                <>
                                                    {card.frontFacePartOne}
                                                    {card.frontFacePartOne &&
                                                        card.frontFacePartTwo &&
                                                        " "}
                                                    {card.frontFacePartTwo && (
                                                        <span className="italic text-primary">
                                                            {card.frontFacePartTwo}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-slate-300">
                                                    No front text
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                                            {card.backFace || (
                                                <span className="text-slate-300">
                                                    No back text
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Card Editor ──────────────────────────────────────────────────────────────

function CardEditor({
    card,
    index,
    onChange,
    onDelete,
}: {
    card: AboutUsCard;
    index: number;
    onChange: (index: number, field: keyof AboutUsCard, value: string) => void;
    onDelete: (index: number) => void;
}) {
    const frontPreview = [card.frontFacePartOne, card.frontFacePartTwo]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Card {index + 1}
                </span>
                <button
                    type="button"
                    onClick={() => onDelete(index)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove card"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Front face part 1 — REQUIRED */}
            <div>
                <FieldLabel required ok={!!card.frontFacePartOne.trim()}>
                    Front Face — Part 1
                </FieldLabel>
                <Textarea
                    value={card.frontFacePartOne}
                    onChange={(e) => onChange(index, "frontFacePartOne", e.target.value)}
                    placeholder='e.g. "What makes Eventify different"'
                    rows={2}
                    className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                    maxLength={200}
                />
                <p className="mt-1 text-[11px] text-slate-400 text-right">
                    {card.frontFacePartOne.length}/200
                </p>
            </div>

            {/* Front face part 2 — optional */}
            <div>
                <FieldLabel ok={!!card.frontFacePartTwo.trim()}>
                    Front Face — Part 2{" "}
                    <span className="ml-1 text-slate-300 font-normal">
                        (optional · shown in accent colour)
                    </span>
                </FieldLabel>
                <Textarea
                    value={card.frontFacePartTwo}
                    onChange={(e) => onChange(index, "frontFacePartTwo", e.target.value)}
                    placeholder='e.g. "is simple, people come back."'
                    rows={2}
                    className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                    maxLength={200}
                />
                <p className="mt-1 text-[11px] text-slate-400 text-right">
                    {card.frontFacePartTwo.length}/200
                </p>
            </div>

            {/* Front preview */}
            {frontPreview && (
                <div className="px-3 py-2 bg-white border border-slate-100 rounded-lg">
                    <p className="text-[11px] text-slate-400 mb-1">Front preview</p>
                    <p className="text-xs font-medium text-footer-bg normal-case leading-relaxed">
                        {card.frontFacePartOne}
                        {card.frontFacePartOne && card.frontFacePartTwo && " "}
                        {card.frontFacePartTwo && (
                            <span className="font-abc-laica-a-italic-variable-trial text-primary">
                                {card.frontFacePartTwo}
                            </span>
                        )}
                    </p>
                </div>
            )}

            {/* Back face — REQUIRED */}
            <div>
                <FieldLabel required ok={!!card.backFace.trim()}>
                    Back Face (description shown on hover)
                </FieldLabel>
                <Textarea
                    value={card.backFace}
                    onChange={(e) => onChange(index, "backFace", e.target.value)}
                    placeholder="e.g. Over the years, Eventify has built lasting relationships…"
                    rows={4}
                    className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                    maxLength={400}
                />
                <p className="mt-1 text-[11px] text-slate-400 text-right">
                    {card.backFace.length}/400
                </p>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AboutUsPage() {
    const toast = useToasts();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [isNew, setIsNew] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    const [formData, setFormData] = useState<AboutUsData>({
        titlePartOne: "",
        titlePartTwo: "",
        description: "",
        image: "",
        imageAlt: "Eventify Banner Image",
        cards: [],
    });

    // ── Completion ────────────────────────────────────────────────────────────

    const completion = useMemo(
        () => [
            {
                label: "Title (Part 1)",
                ok: !!formData.titlePartOne.trim(),
                required: true,
            },
            {
                label: "Description",
                ok: !!formData.description.trim(),
                required: true,
            },
            {
                label: "Section Image",
                ok: !!formData.image.trim(),
                required: true,
            },
            {
                label: "Title (Part 2)",
                ok: !!formData.titlePartTwo.trim(),
                required: false,
            },
            {
                label: `Cards (${formData.cards.length}/${MAX_CARDS})`,
                ok:
                    formData.cards.length > 0 &&
                    formData.cards.every(
                        (c) => c.frontFacePartOne.trim() && c.backFace.trim()
                    ),
                required: false,
            },
        ],
        [formData],
    );

    const requiredItems = completion.filter((c) => c.required);
    const completionPct = Math.round(
        (completion.filter((c) => c.ok).length / completion.length) * 100,
    );
    const isFormValid = requiredItems.every((c) => c.ok);

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchAboutUs = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const res = await fetch("/api/about-us");
            const data = await res.json();

            if (data.success && data.data) {
                const d = data.data;
                setFormData({
                    id: d.id,
                    titlePartOne: d.titlePartOne || "",
                    titlePartTwo: d.titlePartTwo || "",
                    description: d.description || "",
                    image: d.image || "",
                    imageAlt: d.imageAlt || "Eventify Banner Image",
                    // ✅ Fixed: map frontFacePartOne / frontFacePartTwo correctly
                    cards: (d.cards || []).map((c: any) => ({
                        id: c.id,
                        frontFacePartOne: c.frontFacePartOne || "",
                        frontFacePartTwo: c.frontFacePartTwo || "",
                        backFace: c.backFace || "",
                        sortOrder: c.sortOrder,
                    })),
                });
                setIsNew(false);
            } else {
                setIsNew(true);
                setShowEditForm(true);
            }
        } catch {
            toast.error("Failed to load About Us data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAboutUs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Image upload ──────────────────────────────────────────────────────────

    const handleImageUpload = async (files: File[]) => {
        if (!files.length) return;
        const file = files[0];

        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            toast.error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB`);
            setImageFiles([]);
            return;
        }

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload?folder=about-us", {
                method: "POST",
                body: fd,
            });
            const result = await res.json();

            if (result.success) {
                setFormData((p) => ({ ...p, image: result.path }));
                toast.success("Image uploaded");
            } else {
                toast.error(result.error || "Failed to upload image");
                setImageFiles([]);
            }
        } catch {
            toast.error("Failed to upload image");
            setImageFiles([]);
        } finally {
            setUploading(false);
        }
    };

    // ── Card management ───────────────────────────────────────────────────────

    const handleAddCard = () => {
        if (formData.cards.length >= MAX_CARDS) {
            toast.warning(`Maximum ${MAX_CARDS} cards allowed`);
            return;
        }
        setFormData((p) => ({
            ...p,
            cards: [
                ...p.cards,
                {
                    frontFacePartOne: "",
                    frontFacePartTwo: "",
                    backFace: "",
                    sortOrder: p.cards.length,
                },
            ],
        }));
    };

    const handleCardChange = (
        index: number,
        field: keyof AboutUsCard,
        value: string,
    ) => {
        setFormData((p) => {
            const cards = [...p.cards];
            cards[index] = { ...cards[index], [field]: value };
            return { ...p, cards };
        });
    };

    const handleCardDelete = (index: number) => {
        setFormData((p) => ({
            ...p,
            cards: p.cards
                .filter((_, i) => i !== index)
                .map((c, i) => ({ ...c, sortOrder: i })),
        }));
    };

    // ── Save ──────────────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!isFormValid) {
            toast.warning("Please fill in all required fields");
            return;
        }

        const incompleteCard = formData.cards.find(
            (c) => !c.frontFacePartOne.trim() || !c.backFace.trim(),
        );
        if (incompleteCard) {
            toast.warning(
                "Each card must have Front Face Part 1 and a Back Face. Remove or complete all cards.",
            );
            return;
        }

        setSaving(true);
        try {
            const payload = {
                titlePartOne: formData.titlePartOne.trim(),
                titlePartTwo: formData.titlePartTwo.trim() || undefined,
                description: formData.description.trim(),
                image: formData.image,
                imageAlt: formData.imageAlt.trim() || "Eventify Banner Image",
                cards: formData.cards.map((c, i) => ({
                    ...(c.id ? { id: c.id } : {}),
                    frontFacePartOne: c.frontFacePartOne.trim(),
                    frontFacePartTwo: c.frontFacePartTwo.trim() || undefined,
                    backFace: c.backFace.trim(),
                    sortOrder: i,
                })),
            };

            const res = await fetch("/api/about-us", {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await res.json();

            if (result.success) {
                toast.success(isNew ? "About Us created!" : "About Us updated!");
                setIsNew(false);
                setShowEditForm(false);
                fetchAboutUs();
            } else {
                toast.error(result.error || "Failed to save");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const inp =
        "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

    // ── Loading ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6 max-w-full">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <DashboardHeader
                    title="About Us"
                    description="Manage the About Us section shown on the homepage."
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchAboutUs(true)}
                    disabled={refreshing || saving}
                    className="h-8 text-xs gap-1.5 shrink-0 mt-1"
                >
                    <RefreshCw
                        className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>
            </div>

            {/* No data banner */}
            {isNew && (
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    No About Us content found. Click{" "}
                    <strong className="mx-0.5">Update Content</strong> below to
                    create it.
                </div>
            )}

            {/* Current data preview */}
            {!isNew && <CurrentDataPreview data={formData} />}

            {/* Accordion toggle */}
            <div className="space-y-0">
                <button
                    type="button"
                    onClick={() => setShowEditForm((v) => !v)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 bg-white border border-slate-200 transition-all duration-200 text-left group ${
                        showEditForm
                            ? "rounded-t-xl border-b-slate-100"
                            : "rounded-xl hover:border-slate-300"
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                                showEditForm
                                    ? "bg-slate-900"
                                    : "bg-slate-100 group-hover:bg-slate-200"
                            }`}
                        >
                            <Pencil
                                className={`h-3 w-3 transition-colors ${
                                    showEditForm ? "text-white" : "text-slate-600"
                                }`}
                            />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-700">
                                {isNew ? "Create About Us Content" : "Update Content"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                                {showEditForm
                                    ? "Click to collapse the editor"
                                    : isNew
                                    ? "Fill in the form to create your About Us section"
                                    : "Edit title, description, image and flip cards"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!showEditForm && !isNew && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                                <Pencil className="h-3 w-3" /> Edit
                            </span>
                        )}
                        {showEditForm ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                    </div>
                </button>

                {/* Collapsible form */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        showEditForm
                            ? "max-h-[9999px] opacity-100"
                            : "max-h-0 opacity-0"
                    }`}
                >
                    <div className="border border-t-0 border-slate-200 rounded-b-xl">
                        <div className="flex flex-col xl:flex-row gap-0">
                            {/* Main form */}
                            <div className="flex-1 min-w-0 p-5 space-y-5">
                                {/* Mobile progress */}
                                <div className="flex xl:hidden items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                            style={{ width: `${completionPct}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-medium shrink-0">
                                        {completionPct}% complete
                                    </span>
                                </div>

                                {/* SECTION 1: Heading & Description */}
                                <section className="bg-white border border-slate-200 rounded-xl p-5">
                                    <SectionHeading label="Heading & Description" />
                                    <div className="space-y-4">
                                        <div>
                                            <FieldLabel
                                                required
                                                ok={!!formData.titlePartOne.trim()}
                                            >
                                                Title — Part 1
                                            </FieldLabel>
                                            <Input
                                                value={formData.titlePartOne}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        titlePartOne: e.target.value,
                                                    }))
                                                }
                                                placeholder="e.g. The team behind"
                                                className={inp}
                                                maxLength={50}
                                            />
                                            <p className="mt-1 text-[11px] text-slate-400 text-right">
                                                {formData.titlePartOne.length}/50
                                            </p>
                                        </div>

                                        <div>
                                            <FieldLabel ok={!!formData.titlePartTwo.trim()}>
                                                Title — Part 2{" "}
                                                <span className="ml-1 text-slate-300 font-normal">
                                                    (optional)
                                                </span>
                                            </FieldLabel>
                                            <Input
                                                value={formData.titlePartTwo}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        titlePartTwo: e.target.value,
                                                    }))
                                                }
                                                placeholder="e.g. every celebration"
                                                className={inp}
                                                maxLength={50}
                                            />
                                            <p className="mt-1 text-[11px] text-slate-400 text-right">
                                                {formData.titlePartTwo.length}/50
                                            </p>
                                        </div>

                                        {/* Title preview */}
                                        {(formData.titlePartOne ||
                                            formData.titlePartTwo) && (
                                            <div className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                                                <p className="text-[11px] text-slate-400 mb-1">
                                                    Preview
                                                </p>
                                                <p className="text-lg font-bold text-footer-bg normal-case leading-tight">
                                                    {formData.titlePartOne}
                                                    {formData.titlePartTwo && (
                                                        <>
                                                            {" "}
                                                            <span className="font-abc-laica-a-italic-variable-trial text-primary">
                                                                {formData.titlePartTwo}
                                                            </span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <FieldLabel
                                                required
                                                ok={!!formData.description.trim()}
                                            >
                                                Description
                                            </FieldLabel>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        description: e.target.value,
                                                    }))
                                                }
                                                placeholder="e.g. Eventify is a Dubai-born events company redefining how people experience culture…"
                                                rows={5}
                                                className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION 2: Image */}
                                <section className="bg-white border border-slate-200 rounded-xl p-5">
                                    <SectionHeading label="Section Image" />
                                    <p className="text-[11px] text-slate-400 mb-3">
                                        Max size:{" "}
                                        <span className="font-medium text-slate-600">
                                            {MAX_IMAGE_SIZE_MB}MB
                                        </span>{" "}
                                        · Accepted: JPG, PNG, WebP
                                    </p>

                                    <ImageUploader
                                        files={imageFiles}
                                        onChange={(f) => {
                                            setImageFiles(f);
                                            handleImageUpload(f);
                                        }}
                                        maxFiles={1}
                                        maxSize={MAX_IMAGE_SIZE_MB}
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                    />

                                    {uploading && (
                                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Uploading…
                                        </div>
                                    )}

                                    {formData.image && !uploading && (
                                        <div className="mt-3 relative group rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                            <div className="relative w-full h-56">
                                                <Image
                                                    src={formData.image}
                                                    alt={
                                                        formData.imageAlt ||
                                                        "About Us image"
                                                    }
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData((p) => ({
                                                        ...p,
                                                        image: "",
                                                    }));
                                                    setImageFiles([]);
                                                }}
                                                className="absolute top-2 right-2 p-1 rounded-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <FieldLabel ok={!!formData.imageAlt.trim()}>
                                            Image Alt Text{" "}
                                            <span className="ml-1 text-slate-300 font-normal">
                                                (optional)
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            value={formData.imageAlt}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    imageAlt: e.target.value,
                                                }))
                                            }
                                            placeholder="e.g. Eventify team at work"
                                            className={inp}
                                        />
                                    </div>
                                </section>

                                {/* SECTION 3: Cards */}
                                <section className="bg-white border border-slate-200 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <SectionHeading
                                            label={`Flip Cards (${formData.cards.length}/${MAX_CARDS})`}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={handleAddCard}
                                            disabled={
                                                formData.cards.length >= MAX_CARDS
                                            }
                                            className="h-7 text-xs gap-1.5 shrink-0"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add Card
                                        </Button>
                                    </div>

                                    {formData.cards.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                                            <p className="text-sm text-slate-400 mb-3">
                                                No cards yet — add up to {MAX_CARDS}
                                            </p>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={handleAddCard}
                                                className="h-7 text-xs gap-1.5"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add First Card
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.cards.map((card, index) => (
                                                <CardEditor
                                                    key={index}
                                                    card={card}
                                                    index={index}
                                                    onChange={handleCardChange}
                                                    onDelete={handleCardDelete}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <p className="mt-3 text-[11px] text-slate-400">
                                        Cards appear on the left side of the About Us
                                        section. Hover to flip. Part 2 of the front
                                        face is shown in the accent colour.
                                    </p>
                                </section>

                                {/* Form actions */}
                                <div className="flex items-center gap-3 pt-1 pb-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={saving || uploading || !isFormValid}
                                        className="h-9 text-xs bg-slate-900 hover:bg-slate-700 text-white px-5"
                                    >
                                        {saving ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                        ) : (
                                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                                        )}
                                        {isNew ? "Create" : "Save Changes"}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowEditForm(false)}
                                        disabled={saving}
                                        className="h-9 text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    {!isFormValid && (
                                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3 text-red-300" />
                                            Fill required fields to save
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar */}
                            <aside className="w-full xl:w-60 shrink-0 border-t xl:border-t-0 xl:border-l border-slate-100">
                                <div className="xl:sticky xl:top-6 p-5 space-y-4">
                                    {/* Completion */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-slate-600">
                                                Completion
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                {completion.filter((c) => c.ok).length}/
                                                {completion.length}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                                                style={{ width: `${completionPct}%` }}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            {completion.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="flex items-center gap-2"
                                                >
                                                    {item.ok ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <AlertCircle
                                                            className={`h-3.5 w-3.5 shrink-0 ${
                                                                item.required
                                                                    ? "text-red-300"
                                                                    : "text-slate-200"
                                                            }`}
                                                        />
                                                    )}
                                                    <span
                                                        className={`text-[11px] ${
                                                            item.ok
                                                                ? "text-slate-600"
                                                                : "text-slate-400"
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    {/* Tips */}
                                    <div>
                                        <span className="text-xs font-medium text-slate-600 block mb-2">
                                            Tips
                                        </span>
                                        <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-slate-300 mt-px">·</span>
                                                Title Part 1 + Part 2 are joined as one heading.
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-slate-300 mt-px">·</span>
                                                Image appears on the right side.
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-slate-300 mt-px">·</span>
                                                Keep image under {MAX_IMAGE_SIZE_MB}MB — portrait
                                                works best.
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-slate-300 mt-px">·</span>
                                                Add up to {MAX_CARDS} flip cards. Hover to see
                                                back face.
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-slate-300 mt-px">·</span>
                                                Front Part 1 = plain. Part 2 = accent colour.
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-slate-300 mt-px">·</span>
                                                Back face = detailed description on hover.
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Current image thumbnail */}
                                    {formData.image && (
                                        <>
                                            <div className="h-px bg-slate-100" />
                                            <div>
                                                <span className="text-xs font-medium text-slate-600 block mb-2">
                                                    Current Image
                                                </span>
                                                <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-100">
                                                    <Image
                                                        src={formData.image}
                                                        alt="preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}