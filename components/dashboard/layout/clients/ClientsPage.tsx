"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";
import Link from "next/link";
import { ClientCard } from "./ClientCard";
import { Search, Plus, ArrowUpDown, X, Save, Loader2, GripVertical } from "lucide-react";
import ClientsLoader from "../loader/ClientsLoader";
import DashboardHeader from "../common/Header";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
    id: number;
    name: string;
    description: string | null;
    image: string;
    order: number;
}

// ─── Sortable Card Wrapper ────────────────────────────────────────────────────

function SortableClientCard({ client, onDelete }: { client: Client; onDelete: (id: number) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(client.id) });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <ClientCard {...client} onDelete={onDelete} isRearranging={true} dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLDivElement>} />
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientsPage() {
    const toast = useToasts();

    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Rearrange mode state
    const [isRearranging, setIsRearranging] = useState(false);
    const [rearrangedClients, setRearrangedClients] = useState<Client[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    // ── Sensors ───────────────────────────────────────────────────────────────

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // prevent accidental drags on click
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // ── Data fetching ─────────────────────────────────────────────────────────

    useEffect(() => {
        fetchClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get("/api/clients");
            if (response.data.success) {
                setClients(response.data.data);
            } else {
                toast.error("Failed to load clients");
            }
        } catch {
            toast.error("Failed to load clients");
        } finally {
            setLoading(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────

    const handleDelete = async (id: number) => {
        const clientToDelete = clients.find((c) => c.id === id);
        toast.message({
            text: `Delete "${clientToDelete?.name}"?`,
            preserve: true,
            action: "Delete",
            onAction: async () => {
                try {
                    const response = await axios.delete(`/api/clients/${id}`);
                    if (response.data.success) {
                        setClients((prev) => prev.filter((c) => c.id !== id));
                        toast.success("Client deleted successfully!");
                    } else {
                        toast.error(response.data.message || "Failed to delete client");
                    }
                } catch {
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    // ── Rearrange mode ────────────────────────────────────────────────────────

    const handleEnableRearrange = () => {
        // snapshot current order into rearrangedClients
        setRearrangedClients([...clients]);
        setIsDirty(false);
        setIsRearranging(true);
        // clear search so all clients are visible while rearranging
        setSearchQuery("");
    };

    const handleCancelRearrange = () => {
        setIsRearranging(false);
        setRearrangedClients([]);
        setIsDirty(false);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = rearrangedClients.findIndex((c) => String(c.id) === active.id);
        const newIndex = rearrangedClients.findIndex((c) => String(c.id) === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            setRearrangedClients((prev) => arrayMove(prev, oldIndex, newIndex));
            setIsDirty(true);
        }
    };

    const handleSaveOrder = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/clients/reorder", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ids: rearrangedClients.map((c) => c.id),
                }),
            });
            const data = await res.json();

            if (data.success) {
                // Apply new order to main clients list
                setClients(rearrangedClients);
                setIsRearranging(false);
                setIsDirty(false);
                toast.success("Client order saved successfully!");
            } else {
                toast.error("Failed to save order");
            }
        } catch {
            toast.error("Failed to save order");
        } finally {
            setSaving(false);
        }
    };

    // ── Derived data ──────────────────────────────────────────────────────────

    // In rearrange mode we show all clients (no search filter)
    const displayClients = isRearranging ? rearrangedClients : clients.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // ── Loading state ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Clients" description="Manage your clients" />
                    <Button asChild>
                        <Link href="/dashboard/clients/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Client
                        </Link>
                    </Button>
                </div>
                <div className="mt-3">
                    <ClientsLoader />
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div>
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="pb-6 border-b">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Clients" description={`Manage your clients (${clients.length} total)`} />

                    <div className="flex items-center gap-2">
                        {/* Rearrange toggle button */}
                        {!isRearranging ? (
                            <>
                                <Button variant="outline" size="sm" onClick={handleEnableRearrange} disabled={clients.length < 2} className="gap-1.5">
                                    <ArrowUpDown className="h-4 w-4" />
                                    Rearrange
                                </Button>

                                <Button asChild>
                                    <Link href="/dashboard/clients/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add New Client
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={handleCancelRearrange} disabled={saving} className="gap-1.5">
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>

                                <Button size="sm" onClick={handleSaveOrder} disabled={saving || !isDirty} className="gap-1.5 bg-slate-900 hover:bg-slate-700 text-white">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {saving ? "Saving…" : "Save Order"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Search — hidden in rearrange mode */}
                {!isRearranging && (
                    <div className="flex items-center gap-2 mt-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                        </div>
                    </div>
                )}

                {/* Rearrange mode banner */}
                {isRearranging && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                        {/* <GripVertical className="h-4 w-4 shrink-0" /> */}
                        <span>
                            Drag the{" "}
                            <strong>
                                <GripVertical className="h-3 w-3 inline" />
                            </strong>{" "}
                            handle on each card to reorder. Click <strong>Save Order</strong> when done.
                            {!isDirty && <span className="ml-1 text-amber-500">(no changes yet)</span>}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Grid ─────────────────────────────────────────────────────── */}
            <div className="pt-6">
                {displayClients.length > 0 ? (
                    isRearranging ? (
                        // Drag & drop grid
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={rearrangedClients.map((c) => String(c.id))} strategy={rectSortingStrategy}>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {rearrangedClients.map((client) => (
                                        <SortableClientCard key={client.id} client={client} onDelete={handleDelete} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        // Normal grid
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {displayClients.map((client) => (
                                <ClientCard key={client.id} {...client} onDelete={handleDelete} />
                            ))}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">{searchQuery ? "No clients found matching your search" : "No clients found"}</p>
                        <Button asChild>
                            <Link href="/dashboard/clients/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Client
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
