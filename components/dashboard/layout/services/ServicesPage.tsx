"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";
import Link from "next/link";
import { ServiceCard } from "./ServiceCard";
import { Search, Plus } from "lucide-react";
import DashboardHeader from "../common/Header";

interface Service {
    id: number;
    title: string;
    description: string | null;
    bannerImage: string;
    url: string;
    mediaType: string;
    order: number;
}

export default function ServicesPage() {
    const toast = useToasts();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch("/api/services");
            const data = await res.json();
            if (data.success) {
                setServices(data.data);
            } else {
                toast.error("Failed to load services");
            }
        } catch {
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const serviceToDelete = services.find((s) => s.id === id);
        toast.message({
            text: `Delete "${serviceToDelete?.title}"?`,
            preserve: true,
            action: "Delete",
            onAction: async () => {
                try {
                    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
                    const data = await res.json();
                    if (data.success) {
                        setServices((prev) => prev.filter((s) => s.id !== id));
                        toast.success("Service deleted successfully!");
                    } else {
                        toast.error(data.error || "Failed to delete service");
                    }
                } catch {
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    const filteredServices = services.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Services" description="Manage your services" />
                    <Button asChild>
                        <Link href="/dashboard/services/new">
                            <Plus className="mr-2 h-4 w-4" /> Add New Service
                        </Link>
                    </Button>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-64 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="pb-6 border-b">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader
                        title="Services"
                        description={`Manage your services (${filteredServices.length} total)`}
                    />
                    <Button asChild>
                        <Link href="/dashboard/services/new">
                            <Plus className="mr-2 h-4 w-4" /> Add New Service
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6">
                {filteredServices.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredServices.map((service) => (
                            <ServiceCard key={service.id} {...service} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">
                            {searchQuery ? "No services found matching your search" : "No services yet"}
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/services/new">
                                <Plus className="mr-2 h-4 w-4" /> Add Your First Service
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}