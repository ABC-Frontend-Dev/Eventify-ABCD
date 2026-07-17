"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToasts } from "@/components/ui/toast";
import { X, Loader2, Plus, Trash2, Edit, AlertCircle, CheckCircle2 } from "lucide-react";

interface AwardItem {
    id?: number;
    tempId: string;
    title: string;
    description: string;
}

interface CarouselImage {
    id?: number;
    tempId: string;
    url: string;
}

interface CategoryData {
    id?: number;
    name: string;
    icon: string;
    iconAlt: string;
    items: AwardItem[];
    carouselImages: CarouselImage[];
    gradientWidthClass: string;
}

interface AwardCategoryModalProps {
    isOpen: boolean;
    category: Partial<CategoryData> | null;
    onClose: () => void;
    onSave: (category: CategoryData) => void;
    awardId?: number;
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

export default function AwardCategoryModal({ isOpen, category, onClose, onSave, awardId }: AwardCategoryModalProps) {
    const toast = useToasts();

    const [formData, setFormData] = useState<CategoryData>({
        name: "",
        icon: "",
        iconAlt: "",
        items: [],
        carouselImages: [],
        gradientWidthClass: "w-4/5",
    });

    const [uploadingIcon, setUploadingIcon] = useState(false);
    const [iconFile, setIconFile] = useState<File[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageFile, setImageFile] = useState<File[]>([]);
    const [currentItem, setCurrentItem] = useState<AwardItem | null>(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);

    useEffect(() => {
        if (category) {
            setFormData({
                id: category.id,
                name: category.name || "",
                icon: category.icon || "",
                iconAlt: category.iconAlt || "",
                items: category.items || [],
                carouselImages: category.carouselImages || [],
                gradientWidthClass: category.gradientWidthClass || "w-4/5",
            });
        }
    }, [category, isOpen]);

    if (!isOpen || !category) return null;

    const uploadFile = async (file: File): Promise<string | null> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload?folder=awards", {
            method: "POST",
            body: fd,
        });
        const result = await res.json();
        return result.success ? result.path : null;
    };

    const handleIconUpload = async (files: File[]) => {
        if (!files.length) return;
        setUploadingIcon(true);
        const path = await uploadFile(files[0]).catch(() => null);
        setUploadingIcon(false);
        setIconFile([]);
        if (path) {
            setFormData((p) => ({ ...p, icon: path }));
            toast.success("Icon uploaded");
        } else toast.error("Failed to upload icon");
    };

    const handleCarouselImageUpload = async (files: File[]) => {
        if (!files.length) return;
        setUploadingImage(true);
        const paths = (await Promise.all(files.map(uploadFile))).filter(Boolean) as string[];
        setUploadingImage(false);
        setImageFile([]);
        if (paths.length) {
            const newImages = paths.map((path) => ({
                tempId: `temp-${Date.now()}-${Math.random()}`,
                url: path,
            }));
            setFormData((p) => ({
                ...p,
                carouselImages: [...p.carouselImages, ...newImages],
            }));
            toast.success(`${paths.length} image(s) uploaded`);
        }
    };

    const handleAddItem = () => {
        setCurrentItem({
            tempId: `temp-${Date.now()}`,
            title: "",
            description: "",
        });
        setIsItemModalOpen(true);
    };

    const handleEditItem = (item: AwardItem) => {
        setCurrentItem({ ...item });
        setIsItemModalOpen(true);
    };

    const handleSaveItem = () => {
        if (!currentItem?.title.trim()) {
            toast.warning("Award title is required");
            return;
        }
        if (!currentItem?.description.trim()) {
            toast.warning("Award description is required");
            return;
        }

        const idx = formData.items.findIndex((i) => i.tempId === currentItem.tempId);
        if (idx >= 0) {
            const items = [...formData.items];
            items[idx] = currentItem;
            setFormData((p) => ({ ...p, items }));
            toast.success("Award updated");
        } else {
            setFormData((p) => ({ ...p, items: [...p.items, currentItem] }));
            toast.success("Award added");
        }
        setIsItemModalOpen(false);
        setCurrentItem(null);
    };

    const handleDeleteItem = (tempId: string) => {
        setFormData((p) => ({
            ...p,
            items: p.items.filter((i) => i.tempId !== tempId),
        }));
        toast.success("Award deleted");
    };

    const handleDeleteCarouselImage = (tempId: string) => {
        setFormData((p) => ({
            ...p,
            carouselImages: p.carouselImages.filter((i) => i.tempId !== tempId),
        }));
        toast.success("Image removed");
    };

    const handleSaveCategory = () => {
        if (!formData.name.trim()) {
            toast.warning("Category name is required");
            return;
        }
        if (!formData.icon.trim()) {
            toast.warning("Category icon is required");
            return;
        }
        if (formData.items.length === 0) {
            toast.warning("Add at least one award");
            return;
        }
        if (formData.carouselImages.length === 0) {
            toast.warning("Add at least one carousel image");
            return;
        }

        onSave(formData as CategoryData);
        onClose();
    };

    const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                    {/* Modal header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">{formData.id ? "Edit Category" : "Add Category"}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Set up award category with items and images</p>
                        </div>
                        <button type="button" onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Modal body */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                        {/* Category name and icon */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <FieldLabel required ok={!!formData.name.trim()}>
                                    Category Name
                                </FieldLabel>
                                <Input
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData((p) => ({
                                            ...p,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. WOW Awards Middle East"
                                    className={inp}
                                />
                            </div>

                            <div>
                                <FieldLabel required ok={!!formData.iconAlt.trim()}>
                                    Icon Alt Text
                                </FieldLabel>
                                <Input
                                    value={formData.iconAlt}
                                    onChange={(e) =>
                                        setFormData((p) => ({
                                            ...p,
                                            iconAlt: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. WOW Awards Middle East 2025"
                                    className={inp}
                                />
                            </div>
                        </div>

                        {/* Icon uploader */}
                        <div>
                            <FieldLabel required ok={!!formData.icon}>
                                Category Icon
                            </FieldLabel>

                            <ImageUploader
                                files={iconFile}
                                onChange={(f) => {
                                    setIconFile(f);
                                    handleIconUpload(f);
                                }}
                                maxFiles={1}
                                maxSize={2}
                                accept="image/*"
                            />

                            {uploadingIcon && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Uploading…
                                </div>
                            )}

                            {formData.icon && !uploadingIcon && (
                                <div className="mt-2 relative group h-16 w-16 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                                    <img src={formData.icon} alt="Icon preview" className="h-full w-full object-contain p-2" />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((p) => ({
                                                ...p,
                                                icon: "",
                                            }))
                                        }
                                        className="absolute top-0 right-0 p-0.5 rounded-bl-md bg-white/90 shadow text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Gradient width class */}
                        <div>
                            <FieldLabel>Gradient Width</FieldLabel>
                            <select
                                value={formData.gradientWidthClass}
                                onChange={(e) =>
                                    setFormData((p) => ({
                                        ...p,
                                        gradientWidthClass: e.target.value,
                                    }))
                                }
                                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-400"
                            >
                                <option value="w-4/5">Full (w-4/5)</option>
                                <option value="w-full">Extra Full (w-full)</option>
                                <option value="w-3/4">3/4</option>
                                <option value="w-2/3">2/3</option>
                                <option value="w-1/2">Half (w-1/2)</option>
                            </select>
                        </div>

                        {/* Awards/Items */}
                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-xs font-semibold text-slate-700">Awards</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Add award titles and descriptions</p>
                                </div>
                                <Button type="button" size="sm" onClick={handleAddItem} className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Award
                                </Button>
                            </div>

                            {formData.items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-100 rounded-lg">
                                    <AlertCircle className="h-6 w-6 text-slate-200 mb-1" />
                                    <p className="text-xs text-slate-400">No awards yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {formData.items.map((item, idx) => (
                                        <div key={item.tempId} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                                                        {idx + 1}. {item.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditItem(item)}
                                                        className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteItem(item.tempId)}
                                                        className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Carousel Images */}
                        <div className="pt-4 border-t border-slate-100">
                            <div>
                                <p className="text-xs font-semibold text-slate-700 mb-1">Carousel Images</p>
                                <p className="text-[11px] text-slate-400 mb-3">Upload award showcase images (at least 1 required)</p>
                            </div>

                            <ImageUploader
                                files={imageFile}
                                onChange={(f) => {
                                    setImageFile(f);
                                    handleCarouselImageUpload(f);
                                }}
                                maxFiles={20 - formData.carouselImages.length}
                                maxSize={5}
                                accept="image/*"
                            />

                            {uploadingImage && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Uploading…
                                </div>
                            )}

                            {formData.carouselImages.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-[11px] text-slate-400 mb-2">{formData.carouselImages.length}/20 images</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {formData.carouselImages.map((img, i) => (
                                            <div key={img.tempId} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                                <img src={img.url} alt={`Carousel ${i + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={() => handleDeleteCarouselImage(img.tempId)} className="p-1 rounded-md bg-white/90 text-red-500 shadow">
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <span className="absolute top-1 left-1 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded-full">{i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal footer */}
                    <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 shrink-0">
                        <Button
                            type="button"
                            onClick={handleSaveCategory}
                            disabled={!formData.name || !formData.icon || formData.items.length === 0 || formData.carouselImages.length === 0}
                            size="sm"
                            className="flex-1 h-8 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                        >
                            Save Category
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>

            {/* Item Modal */}
            {isItemModalOpen && currentItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <p className="text-sm font-semibold text-slate-800">{formData.items.find((i) => i.tempId === currentItem.tempId) ? "Edit Award" : "Add Award"}</p>
                            <button type="button" onClick={() => setIsItemModalOpen(false)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="px-5 py-4 space-y-4">
                            <div>
                                <FieldLabel required ok={!!currentItem.title.trim()}>
                                    Award Title
                                </FieldLabel>
                                <Input
                                    value={currentItem.title}
                                    onChange={(e) => setCurrentItem((p) => (p ? { ...p, title: e.target.value } : p))}
                                    placeholder="e.g. Exeed Exlantix Launch"
                                    className={inp}
                                />
                            </div>

                            <div>
                                <FieldLabel required ok={!!currentItem.description.trim()}>
                                    Award Description
                                </FieldLabel>
                                <Textarea
                                    value={currentItem.description}
                                    onChange={(e) =>
                                        setCurrentItem((p) =>
                                            p
                                                ? {
                                                      ...p,
                                                      description: e.target.value,
                                                  }
                                                : p,
                                        )
                                    }
                                    placeholder="e.g. Special Event Of The Year For Government / Federation / Association"
                                    rows={3}
                                    className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100">
                            <Button
                                type="button"
                                onClick={handleSaveItem}
                                disabled={!currentItem.title.trim() || !currentItem.description.trim()}
                                size="sm"
                                className="flex-1 h-8 text-xs bg-slate-900 hover:bg-slate-700 text-white"
                            >
                                Save Award
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsItemModalOpen(false)} className="h-8 text-xs">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
