"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";
import { ProjectCategoriesTable } from "./BlogCategoriesTable";
import { Loader2, FolderTree, Plus, RefreshCw, Save, X } from "lucide-react";

interface BlogCategory {
    id: number;
    name: string;
    description: string | null;
}

export default function BlogCategoriesPage() {
    const toast = useToasts();

    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({ name: "", description: "" });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(false);
        try {
            const response = await fetch("/api/blog-categories");
            const result = await response.json();
            if (result.success) {
                setCategories(result.data);
            } else {
                toast.error("Failed to load categories");
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.warning("Category name is required");
            return;
        }
        setSubmitting(true);
        try {
            const url = editingId ? `/api/blog-categories/${editingId}` : "/api/blog-categories";
            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.success) {
                toast.success(editingId ? "Category updated!" : "Category created!");
                fetchCategories();
                resetForm();
            } else {
                toast.error(result.error || "Failed to save category");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category: BlogCategory) => {
        setEditingId(category.id);
        setFormData({ name: category.name, description: category.description || "" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: number) => {
        const categoryToDelete = categories.find((c) => c.id === id);
        toast.message({
            text: `Delete "${categoryToDelete?.name}"?`,
            preserve: true,
            action: "Delete",
            onAction: async () => {
                try {
                    const response = await fetch(`/api/blog-categories/${id}`, { method: "DELETE" });
                    const result = await response.json();
                    if (result.success) {
                        toast.success("Category deleted!");
                        fetchCategories();
                        if (editingId === id) resetForm();
                    } else {
                        toast.error(result.error || "Failed to delete category");
                    }
                } catch (error) {
                    console.error("Delete error:", error);
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    const resetForm = () => {
        setFormData({ name: "", description: "" });
        setEditingId(null);
    };

    const isFormValid = formData.name.trim().length > 0;

    return (
        <div className="min-h-screen">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <FolderTree className="h-4.5 w-4.5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">Blog Categories</h1>
                            <p className="text-sm text-slate-500">Manage and organize your blog categories</p>
                        </div>
                    </div>
                </div>

                {/* Inline Form */}
                <div className="bg-white rounded-xl border border-slate-200">
                    {/* Form label strip */}
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">{editingId ? "Edit category" : "Add category"}</span>
                        {editingId && (
                            <button onClick={resetForm} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-green-500 text-white hover:text-slate-800 transition-colors">
                                <X className="h-3.5 w-3.5" />
                                Cancel
                            </button>
                        )}
                    </div>

                    {/* Inline fields row */}
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center gap-3 px-5 py-4">
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Category name"
                                className="w-56 h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-100 placeholder:text-slate-400"
                                required
                            />
                            <Input
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Description (optional)"
                                className="flex-1 h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-100 placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={submitting || !isFormValid}
                                className="flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {submitting ? (editingId ? "Saving…" : "Adding…") : editingId ? "Save changes" : "Add category"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Categories Table */}
                <ProjectCategoriesTable categories={categories} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
        </div>
    );
}
