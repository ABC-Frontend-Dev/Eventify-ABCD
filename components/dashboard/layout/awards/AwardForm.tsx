"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Plus, Edit, Trash2, Layers, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import AwardCategoryModal from "./AwardCategoryModal";

interface AwardCategory {
    id?: number;
    name: string;
    icon: string;
    iconAlt: string;
    items: Array<{ id?: number; tempId: string; title: string; description: string }>;
    carouselImages: Array<{ id?: number; tempId: string; url: string }>;
    gradientWidthClass: string;
}

interface AwardFormProps {
    initialData?: {
        year: number;
    };
    awardId?: number;
    mode: "create" | "edit";
}

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

export default function AwardForm({ initialData, awardId, mode }: AwardFormProps) {
    const router = useRouter();
    const toast = useToasts();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        year: initialData?.year || new Date().getFullYear(),
    });

    const [categories, setCategories] = useState<AwardCategory[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Partial<AwardCategory> | null>(null);

    const completion = useMemo(
        () => [
            { label: "Year", ok: !!formData.year },
            { label: "Categories", ok: categories.length > 0 },
        ],
        [formData, categories],
    );

    const completionPct = Math.round((completion.filter((c) => c.ok).length / completion.length) * 100);
    const isFormValid = completion.every((c) => c.ok);

    // Load data in edit mode
    useEffect(() => {
        if (mode !== "edit" || !awardId) return;
        fetch(`/api/awards/${awardId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success && data.data) {
                    setFormData({
                        year: data.data.year,
                    });
                    setCategories(data.data.categories || []);
                }
            })
            .catch(() => toast.error("Failed to load award data"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, awardId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((p) => ({
            ...p,
            [name]: name === "year" ? parseInt(value) : value,
        }));
    };

    const handleOpenCategoryModal = (cat?: AwardCategory) => {
        if (cat) {
            setCurrentCategory(cat);
        } else {
            setCurrentCategory({
                name: "",
                icon: "",
                iconAlt: "",
                items: [],
                carouselImages: [],
                gradientWidthClass: "w-4/5",
            });
        }
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = (category: AwardCategory) => {
        if (category.id) {
            // Edit existing
            setCategories((cats) => cats.map((c) => (c.id === category.id ? category : c)));
            toast.success("Category updated");
        } else {
            // Add new
            setCategories((cats) => [
                ...cats,
                {
                    ...category,
                    id: Math.min(...categories.map((c) => c.id ?? 0), 0) - 1, // Negative ID for new items
                },
            ]);
            toast.success("Category added");
        }
    };

    const handleDeleteCategory = (index: number) => {
        const cat = categories[index];
        toast.message({
            text: `Delete "${cat.name}"?`,
            preserve: true,
            action: "Delete",
            onAction: () => {
                setCategories((cats) => cats.filter((_, i) => i !== index));
                toast.success("Category deleted");
            },
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.warning("Please complete all required fields");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(mode === "create" ? "/api/awards" : `/api/awards/${awardId}`, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    categories: categories.map((cat) => ({
                        name: cat.name,
                        icon: cat.icon,
                        iconAlt: cat.iconAlt,
                        items: cat.items.map((item) => ({
                            title: item.title,
                            description: item.description,
                        })),
                        carouselImages: cat.carouselImages.map((img) => ({
                            url: img.url,
                        })),
                        gradientWidthClass: cat.gradientWidthClass,
                    })),
                }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success(mode === "create" ? "Award created!" : "Award updated!");
                setTimeout(() => {
                    router.push("/dashboard/awards");
                    router.refresh();
                }, 800);
            } else toast.error(result.message || result.error || "Failed to save");
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

    return (
        <div className="min-h-screen bg-slate-50/60">
            {/* Sticky topbar */}
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
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{mode === "create" ? "New award" : `Award ${formData.year}`}</span>

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

            {/* Body */}
            <form id="award-form" onSubmit={handleSubmit} className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col xl:flex-row gap-5">
                {/* Main column */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* AWARD INFO */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <SectionHeading label="Award Info" />
                        <div className="space-y-4">
                            {/* Year */}
                            <div>
                                <FieldLabel required ok={!!formData.year}>
                                    Year
                                </FieldLabel>
                                <Input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="e.g. 2025" className={inp} min="2020" max={new Date().getFullYear() + 10} />
                                <p className="mt-1 text-[11px] text-slate-400">Enter the award year</p>
                            </div>
                        </div>
                    </section>

                    {/* CATEGORIES */}
                    <section className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Award Categories</span>
                                <div className="h-px bg-slate-100 w-16" />
                            </div>
                            <Button type="button" size="sm" onClick={() => handleOpenCategoryModal()} className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Category
                            </Button>
                        </div>

                        {categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-lg">
                                <Layers className="h-8 w-8 text-slate-200 mb-2" />
                                <p className="text-xs text-slate-400">No categories yet — click Add Category to start</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categories.map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <img src={cat.icon} alt={cat.iconAlt} className="h-8 w-auto object-contain" />
                                            <div>
                                                <p className="text-xs font-semibold text-slate-800">{cat.name}</p>
                                                <p className="text-[11px] text-slate-400">
                                                    {cat.items.length} award
                                                    {cat.items.length !== 1 ? "s" : ""} • {cat.carouselImages.length} image
                                                    {cat.carouselImages.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenCategoryModal(cat)}
                                                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCategory(idx)}
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

                    {/* Mobile footer */}
                    <div className="flex sm:hidden gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => router.back()} disabled={loading} className="flex-1 h-9 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={loading || !isFormValid} className="flex-1 h-9 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
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
                                    {completion.filter((c) => c.ok).length}/{completion.length}
                                </span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-3">
                                <div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${completionPct}%` }} />
                            </div>
                            <div className="space-y-1.5">
                                {completion.map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        {item.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 text-slate-200 shrink-0" />}
                                        <span className={`text-[11px] ${item.ok ? "text-slate-600" : "text-slate-400"}`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <span className="text-xs font-medium text-slate-600 block mb-3">Tips</span>
                            <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                                <li>Create award categories (WOW, MEEA, etc.)</li>
                                <li>Upload icon for each category</li>
                                <li>Add 1-10 award items per category</li>
                                <li>Upload carousel showcase images</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </form>

            {/* Category Modal */}
            <AwardCategoryModal
                isOpen={isCategoryModalOpen}
                category={currentCategory}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    setCurrentCategory(null);
                }}
                onSave={handleSaveCategory}
                awardId={awardId}
            />
        </div>
    );
}
