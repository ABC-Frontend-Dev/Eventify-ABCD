"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import ReactGridLayout, { useContainerWidth, noCompactor, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";
import { Search, Plus, LayoutGrid, Save, X, Pencil, Trash2, GripHorizontal, Loader2 } from "lucide-react";

import { TeamCard } from "./TeamCard";
import DashboardHeader from "../common/Header";
import ClientsLoader from "../loader/ClientsLoader";

interface TeamMember {
    id: number;
    name: string;
    role: string;
    image: string;
    gridLayout: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
}

interface GridItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    content: {
        img: string;
        name: string;
        role: string;
    };
}

const COLS = 10;
const ROW_HEIGHT = 60;

/** Returns true only if the string contains at least one a-z / A-Z letter */
function hasLetters(str: string): boolean {
    return /[a-zA-Z]/.test(str);
}

/**
 * Flip is enabled only when BOTH name and role
 * contain at least one real alphabetic character.
 */
function shouldEnableFlip(name: string, role: string): boolean {
    return hasLetters(name) && hasLetters(role);
}

function GridEditor({ members, onDelete }: { members: TeamMember[]; onDelete: (id: number) => void }) {
    const { width, containerRef, mounted } = useContainerWidth();
    const toast = useToasts();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [items, setItems] = useState<GridItem[]>([]);
    const [originalItems, setOriginalItems] = useState<GridItem[]>([]);

    const buildItems = useCallback((memberList: TeamMember[]): GridItem[] => {
        return memberList
            .filter((m) => m.gridLayout !== null)
            .map((m) => ({
                i: String(m.id),
                x: m.gridLayout!.x,
                y: m.gridLayout!.y,
                w: m.gridLayout!.width,
                h: m.gridLayout!.height,
                content: {
                    img: m.image,
                    name: m.name,
                    role: m.role,
                },
            }));
    }, []);

    useEffect(() => {
        const built = buildItems(members);
        setItems(built);
        setOriginalItems(built);
    }, [members, buildItems]);

    const layout = items.map(({ content: _content, ...layoutItem }) => layoutItem);

    const handleLayoutChange = (newLayout: Layout) => {
        setItems((prev) =>
            prev.map((item) => {
                const updated = newLayout.find((l) => l.i === item.i);
                return updated ? { ...item, ...updated } : item;
            }),
        );
    };

    const handleStartEditing = () => {
        setOriginalItems([...items]);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setItems([...originalItems]);
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = items.map((item) => ({
                i: item.i,
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
            }));

            const res = await axios.put("/api/team/layout", payload);
            if (res.data.success) {
                setOriginalItems([...items]);
                setIsEditing(false);
                toast.success("Layout saved successfully!");
            } else {
                toast.error(res.data.error || "Failed to save layout");
            }
        } catch {
            toast.error("Failed to save layout");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-8">
            {/* Grid section header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Grid Layout</span>
                    {isEditing && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Editing</span>}
                </div>

                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving} className="h-8 text-xs">
                                <X className="h-3.5 w-3.5 mr-1.5" />
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-8 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                                {isSaving ? "Saving..." : "Save Layout"}
                            </Button>
                        </>
                    ) : (
                        <Button size="sm" variant="outline" onClick={handleStartEditing} className="h-8 text-xs">
                            <GripHorizontal className="h-3.5 w-3.5 mr-1.5" />
                            Arrange Layout
                        </Button>
                    )}
                </div>
            </div>

            {isEditing && (
                <p className="text-xs text-slate-500 mb-4 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    Drag to reposition • Resize from the bottom-right corner • Cards with <span className="inline-flex items-center gap-1 text-slate-400 font-medium">no-flip</span> badge have no
                    alphabetic name/role — their flip is automatically disabled on the frontend.
                </p>
            )}

            {/* Grid */}
            <div ref={containerRef} className={`rounded-xl border-2 transition-colors ${isEditing ? "border-amber-300 bg-amber-50/30" : "border-slate-100 bg-slate-50/50"}`}>
                {mounted && items.length > 0 && width > 0 && (
                    <ReactGridLayout
                        layout={layout}
                        width={width}
                        gridConfig={{ cols: COLS, rowHeight: ROW_HEIGHT }}
                        compactor={noCompactor}
                        dragConfig={{ enabled: isEditing }}
                        resizeConfig={{ enabled: isEditing }}
                        onLayoutChange={handleLayoutChange}
                    >
                        {items.map((item) => {
                            const flipEnabled = shouldEnableFlip(item.content.name, item.content.role);

                            return (
                                <div
                                    key={item.i}
                                    className={`group relative overflow-hidden rounded-lg transition-all ${
                                        isEditing ? "ring-2 ring-amber-400 cursor-grab active:cursor-grabbing shadow-lg" : "cursor-default"
                                    }`}
                                    style={{ height: "100%" }}
                                >
                                    {/* Image */}
                                    <div className="relative w-full h-full bg-slate-200">
                                        <Image src={item.content.img} alt={item.content.name} fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, 20vw" />
                                    </div>

                                    {/* Name + role overlay */}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
                                        <p className="text-white text-[10px] font-bold leading-tight truncate">{item.content.name}</p>
                                        <p className="text-white/70 text-[9px] truncate">{item.content.role}</p>
                                    </div>

                                    {/* No-flip badge — visible when flip is disabled */}
                                    {!flipEnabled && <div className="absolute top-1 left-1 bg-slate-900/80 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-full leading-none">no-flip</div>}

                                    {/* Action buttons — hover, not editing */}
                                    {!isEditing && (
                                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/dashboard/team/${item.i}/edit`} className="p-1 bg-white/90 hover:bg-white rounded shadow text-slate-700" onClick={(e) => e.stopPropagation()}>
                                                <Pencil className="h-3 w-3" />
                                            </Link>
                                            <button
                                                className="p-1 bg-white/90 hover:bg-red-50 rounded shadow text-red-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(parseInt(item.i));
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Drag handle — editing mode */}
                                    {isEditing && (
                                        <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-70">
                                            <GripHorizontal className="h-4 w-4 text-white drop-shadow" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </ReactGridLayout>
                )}

                {items.length === 0 && <div className="flex items-center justify-center py-16 text-slate-400 text-sm">No team members yet. Add one to get started.</div>}
            </div>
        </div>
    );
}

export default function TeamPage() {
    const toast = useToasts();

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await axios.get("/api/team");
            if (response.data.success) {
                setMembers(response.data.data);
            } else {
                toast.error("Failed to load team members");
            }
        } catch (error) {
            console.error("Error fetching team:", error);
            toast.error("Failed to load team members");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const memberToDelete = members.find((m) => m.id === id);

        toast.message({
            text: `Delete "${memberToDelete?.name}"?`,
            preserve: true,
            action: "Delete",
            onAction: async () => {
                try {
                    const response = await axios.delete(`/api/team/${id}`);
                    if (response.data.success) {
                        await fetchMembers();
                        toast.success("Team member deleted successfully!");
                    } else {
                        toast.error(response.data.message || "Failed to delete team member");
                    }
                } catch (error) {
                    console.error("Error deleting team member:", error);
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    const filteredMembers = members.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Team" description={`Manage your team (${members.length} total)`} />
                    <Button asChild>
                        <Link href="/dashboard/team/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Team Member
                        </Link>
                    </Button>
                </div>
                <div className="mt-3">
                    <ClientsLoader />
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="pb-6 border-b">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Team" description={`Manage your team (${members.length} total)`} />
                    <Button asChild>
                        <Link href="/dashboard/team/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Team Member
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center gap-2 mt-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search team..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                </div>
            </div>

            {/* Cards overview */}
            <div className="pt-6">
                {filteredMembers.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {filteredMembers.map((member) => (
                            <TeamCard key={member.id} id={member.id} name={member.name} role={member.role} image={member.image} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">{searchQuery ? "No team members found matching your search" : "No team members found"}</p>
                        <Button asChild>
                            <Link href="/dashboard/team/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Team Member
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Grid Layout Editor */}
            {members.length > 0 && <GridEditor members={members} onDelete={handleDelete} />}
        </div>
    );
}
