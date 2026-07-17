"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToasts } from "@/components/ui/toast";
import Link from "next/link";
import { ComparisonCard } from "./ComparisonCard";
import { Plus } from "lucide-react";
import DashboardHeader from "../common/Header";

interface Comparison {
    id: number;
    title: string;
    beforeImage: string;
    afterImage: string;
    order: number;
}

export default function ComparisonsPage() {
    const toast = useToasts();

    const [comparisons, setComparisons] = useState<Comparison[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComparisons();
    }, []);

    const fetchComparisons = async () => {
        try {
            const response = await axios.get("/api/comparisons");

            if (response.data.success) {
                setComparisons(response.data.data);
            } else {
                toast.error("Failed to load comparisons");
            }
        } catch (error) {
            console.error("Error fetching comparisons:", error);
            toast.error("Failed to load comparisons");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const comparisonToDelete = comparisons.find((c) => c.id === id);

        toast.message({
            text: `Delete "${comparisonToDelete?.title}"?`,
            preserve: true,
            action: "Delete",

            onAction: async () => {
                try {
                    const response = await axios.delete(`/api/comparisons/${id}`);

                    if (response.data.success) {
                        setComparisons(comparisons.filter((comparison) => comparison.id !== id));
                        toast.success("Comparison deleted successfully!");
                    } else {
                        toast.error(response.data.message || "Failed to delete comparison");
                    }
                } catch (error) {
                    console.error("Error deleting comparison:", error);
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Comparisons" description={`Manage your comparisons (${comparisons.length} total)`} />

                    <Button asChild>
                        <Link href="/dashboard/comparisons/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Comparison
                        </Link>
                    </Button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="">
            {/* Header */}
            <div className="pb-6 border-b">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <DashboardHeader title="Comparisons" description={`Manage your comparisons (${comparisons.length} total)`} />
                    </div>

                    <Button asChild>
                        <Link href="/dashboard/comparisons/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Comparison
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Comparisons Grid */}
            <div className="pt-6">
                {comparisons.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {comparisons.map((comparison) => (
                            <ComparisonCard key={comparison.id} {...comparison} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">No comparisons found</p>

                        <Button asChild>
                            <Link href="/dashboard/comparisons/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Comparison
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
