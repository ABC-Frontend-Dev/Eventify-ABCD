"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToasts } from "@/components/ui/toast";
import Link from "next/link";
import { AwardCard } from "./AwardCard";
import { Plus, Trophy } from "lucide-react";
import DashboardHeader from "../common/Header";

interface Award {
    id: number;
    year: number;
    categories: Array<{ id: number; images: Array<{ id: number }> }>;
}

export default function AwardsPage() {
    const toast = useToasts();
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAwards();
    }, []);

    const fetchAwards = async () => {
        try {
            const response = await axios.get("/api/awards");
            if (response.data.success) {
                setAwards(response.data.data);
            } else {
                toast.error("Failed to load awards");
            }
        } catch {
            toast.error("Failed to load awards");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const awardToDelete = awards.find((a) => a.id === id);
        toast.message({
            text: `Delete award year ${awardToDelete?.year}?`,
            preserve: true,
            action: "Delete",
            onAction: async () => {
                try {
                    const response = await axios.delete(`/api/awards/${id}`);
                    if (response.data.success) {
                        setAwards(awards.filter((a) => a.id !== id));
                        toast.success("Award deleted successfully!");
                    } else {
                        toast.error("Failed to delete award");
                    }
                } catch {
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 border-b">
                    <DashboardHeader title="Awards" description="Manage your award years and categories" />
                    <Button asChild>
                        <Link href="/dashboard/awards/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Award Year
                        </Link>
                    </Button>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="pb-6 border-b">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader
                        title="Awards"
                        description={`${awards.length} award year${awards.length !== 1 ? "s" : ""} · ${awards.reduce((acc, a) => acc + a.categories.length, 0)} categories total`}
                    />
                    <Button asChild className="shrink-0">
                        <Link href="/dashboard/awards/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Award Year
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="pt-6">
                {awards.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {awards.map((award) => (
                            <AwardCard
                                key={award.id}
                                id={award.id}
                                year={award.year}
                                categoriesCount={award.categories.length}
                                imagesCount={award.categories.reduce((acc, cat) => acc + (cat.images?.length || 0), 0)}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-100 rounded-xl">
                        <Trophy className="h-12 w-12 text-slate-200 mb-4" />
                        <p className="text-sm font-medium text-slate-400 mb-1">No awards yet</p>
                        <p className="text-xs text-slate-300 mb-5">Add your first award year to get started</p>
                        <Button asChild>
                            <Link href="/dashboard/awards/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Award Year
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
