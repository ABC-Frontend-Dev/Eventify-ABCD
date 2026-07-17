"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToasts } from "@/components/ui/toast";
import Link from "next/link";
import { AwardCard } from "./AwardCard";
import { Plus } from "lucide-react";
import DashboardHeader from "../common/Header";

interface Award {
    id: number;
    year: number;
    categories: Array<{ id: number }>;
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
        } catch (error) {
            console.error("Error fetching awards:", error);
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
                        setAwards(awards.filter((award) => award.id !== id));
                        toast.success("Award deleted successfully!");
                    } else {
                        toast.error(response.data.message || "Failed to delete award");
                    }
                } catch (error) {
                    console.error("Error deleting award:", error);
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Awards" description={`Manage your awards (${awards.length} total)`} />

                    <Button asChild>
                        <Link href="/dashboard/awards/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Award Year
                        </Link>
                    </Button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-slate-100 rounded-lg animate-pulse" />
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
                        <DashboardHeader title="Awards" description={`Manage your awards (${awards.length} total)`} />
                    </div>

                    <Button asChild>
                        <Link href="/dashboard/awards/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Award Year
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Awards Grid */}
            <div className="pt-6">
                {awards.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {awards.map((award) => (
                            <AwardCard key={award.id} {...award} categoriesCount={award.categories.length} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">No awards found</p>

                        <Button asChild>
                            <Link href="/dashboard/awards/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Award
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
