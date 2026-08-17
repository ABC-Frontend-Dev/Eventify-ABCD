// components/dashboard/layout/instagram/InstagramPage.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToasts } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react";
import DashboardHeader from "../common/Header";
import { InstagramLogoIcon } from "@phosphor-icons/react";

interface InstagramPost {
    id: number;
    url: string;
    image: string | null;
    title: string | null;
    isEnabled: boolean;
    order: number;
    createdAt: string;
}

const MAX_POSTS = 10;
const MAX_ENABLED = 5;

const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

// ─── Sortable row ─────────────────────────────────────────────────────────────
function SortablePostRow({
    post,
    enabledCount,
    onToggle,
    onDelete,
    isTogglingId,
    isDeletingId,
}: {
    post: InstagramPost;
    enabledCount: number;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
    isTogglingId: number | null;
    isDeletingId: number | null;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    const canEnable = post.isEnabled || enabledCount < MAX_ENABLED;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-3 bg-white border rounded-xl transition-all ${isDragging ? "shadow-xl border-slate-300" : "border-slate-200 hover:border-slate-300"}`}
        >
            {/* Drag handle */}
            <button {...attributes} {...listeners} className="p-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0 touch-none" aria-label="Drag to reorder">
                <GripVertical className="h-4 w-4" />
            </button>

            {/* Thumbnail */}
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative">
                {post.image ? (
                    <Image src={post.image} alt={post.title ?? "Instagram post"} fill className="object-cover" unoptimized sizes="48px" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <InstagramLogoIcon className="h-5 w-5 text-slate-300" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{post.title ?? "No preview available"}</p>
                <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-400 hover:text-primary flex items-center gap-0.5 truncate max-w-xs mt-0.5 transition-colors"
                >
                    {post.url.length > 50 ? post.url.slice(0, 50) + "…" : post.url}
                    <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                </a>
            </div>

            {/* Status badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${post.isEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {post.isEnabled ? "Enabled" : "Disabled"}
            </span>

            {/* Toggle */}
            <button
                onClick={() => onToggle(post.id)}
                disabled={isTogglingId === post.id || (!canEnable && !post.isEnabled)}
                title={!canEnable && !post.isEnabled ? `Max ${MAX_ENABLED} posts can be enabled` : post.isEnabled ? "Disable post" : "Enable post"}
                className={`p-1.5 rounded-md transition-colors shrink-0 ${
                    post.isEnabled ? "text-emerald-600 hover:bg-emerald-50" : !canEnable ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:bg-slate-100"
                }`}
            >
                {isTogglingId === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : post.isEnabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>

            {/* Delete */}
            <button onClick={() => onDelete(post.id)} disabled={isDeletingId === post.id} className="p-1.5 rounded-md text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0">
                {isDeletingId === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InstagramPage() {
    const toast = useToasts();
    const toastRef = useRef(toast);

    const [posts, setPosts] = useState<InstagramPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [isTogglingId, setIsTogglingId] = useState<number | null>(null);
    const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [orderChanged, setOrderChanged] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    useEffect(() => {
        toastRef.current = toast;
    });

    const fetchPosts = useCallback(async () => {
        try {
            const res = await axios.get("/api/instagram");
            if (res.data.success) {
                setPosts(res.data.data);
            }
        } catch {
            toast.error("Failed to load Instagram posts.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const enabledCount = posts.filter((p) => p.isEnabled).length;

    // ── Add post ──────────────────────────────────────────────────────────────
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!urlInput.trim()) return;

        setAdding(true);
        try {
            const res = await axios.post("/api/instagram", {
                url: urlInput.trim(),
            });
            if (res.data.success) {
                toast.success("Post added! Preview pre-fetched.");
                setUrlInput("");
                fetchPosts();
            } else {
                toast.error(res.data.error);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to add post.");
        } finally {
            setAdding(false);
        }
    };

    // ── Toggle enable/disable ─────────────────────────────────────────────────
    const handleToggle = async (id: number) => {
        setIsTogglingId(id);
        try {
            const res = await axios.patch(`/api/instagram/${id}`, {
                type: "toggle",
            });
            if (res.data.success) {
                setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, isEnabled: res.data.data.isEnabled } : p)));
                toast.success(res.data.message);
            } else {
                toast.error(res.data.error);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to update post.");
        } finally {
            setIsTogglingId(null);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = (id: number) => {
        const post = posts.find((p) => p.id === id);
        toast.message({
            text: `Delete this Instagram post?`,
            preserve: true,
            action: "Delete",
            onAction: async () => {
                setIsDeletingId(id);
                try {
                    const res = await axios.delete(`/api/instagram/${id}`);
                    if (res.data.success) {
                        toast.success("Post deleted.");
                        fetchPosts();
                    } else {
                        toast.error(res.data.error);
                    }
                } catch {
                    toast.error("Failed to delete post.");
                } finally {
                    setIsDeletingId(null);
                }
            },
        });
    };

    // ── Drag end ──────────────────────────────────────────────────────────────
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setPosts((prev) => {
            const oldIndex = prev.findIndex((p) => p.id === active.id);
            const newIndex = prev.findIndex((p) => p.id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
        setOrderChanged(true);
    };

    // ── Save order ────────────────────────────────────────────────────────────
    const handleSaveOrder = async () => {
        setIsSavingOrder(true);
        try {
            const res = await axios.put("/api/instagram/reorder", {
                orderedIds: posts.map((p) => p.id),
            });
            if (res.data.success) {
                toast.success("Order saved!");
                setOrderChanged(false);
            } else {
                toast.error(res.data.error);
            }
        } catch {
            toast.error("Failed to save order.");
        } finally {
            setIsSavingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <DashboardHeader title="Instagram Posts" description={`${posts.length}/${MAX_POSTS} posts · ${enabledCount}/${MAX_ENABLED} enabled`} />

            {/* ── Add new post ── */}
            {posts.length < MAX_POSTS && (
                <section className="bg-white border border-slate-200 rounded-xl p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Add Instagram Post</p>
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://www.instagram.com/reel/..." className={`${inp} flex-1`} disabled={adding} />
                        <Button type="submit" size="sm" disabled={adding || !urlInput.trim()} className="h-9 text-xs bg-slate-900 hover:bg-slate-700 text-white shrink-0">
                            {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
                            {adding ? "Fetching preview…" : "Add Post"}
                        </Button>
                    </form>
                    <p className="mt-2 text-[11px] text-slate-400">Paste any Instagram post, reel, or photo URL. Preview image is fetched automatically.</p>
                </section>
            )}

            {posts.length >= MAX_POSTS && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <p className="text-xs text-amber-700">⚠️ Maximum {MAX_POSTS} posts reached. Delete a post to add a new one.</p>
                </div>
            )}

            {/* ── Posts list ── */}
            {posts.length > 0 ? (
                <section className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">All Posts</p>

                        {/* Save order button — appears after drag */}
                        {orderChanged && (
                            <Button size="sm" onClick={handleSaveOrder} disabled={isSavingOrder} className="h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                                {isSavingOrder ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                                Save Order
                            </Button>
                        )}
                    </div>

                    {/* Enabled counter */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(enabledCount / MAX_ENABLED) * 100}%`,
                                }}
                            />
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">
                            {enabledCount}/{MAX_ENABLED} enabled
                        </span>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {posts.map((post) => (
                                    <SortablePostRow
                                        key={post.id}
                                        post={post}
                                        enabledCount={enabledCount}
                                        onToggle={handleToggle}
                                        onDelete={handleDelete}
                                        isTogglingId={isTogglingId}
                                        isDeletingId={isDeletingId}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <p className="mt-4 text-[11px] text-slate-400">Drag rows to reorder · Only enabled posts appear on the frontend · Max {MAX_ENABLED} enabled at once</p>
                </section>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                    <InstagramLogoIcon className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No Instagram posts yet</p>
                    <p className="text-[11px] text-slate-300 mt-1">Add your first post above</p>
                </div>
            )}

            {/* ── Tips ── */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-600 mb-3">Tips</p>
                <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                    <li>You can add up to {MAX_POSTS} posts total.</li>
                    <li>Only {MAX_ENABLED} enabled posts show on the frontend.</li>
                    <li>Drag rows to change the display order.</li>
                    <li>Preview images are fetched once when you add the URL — no live API calls on the frontend.</li>
                    <li>Supports Instagram posts, reels, and photo URLs.</li>
                </ul>
            </div>
        </div>
    );
}
