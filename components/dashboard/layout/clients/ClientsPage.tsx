// components/dashboard/layout/clients/ClientsPage.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";

import Link from "next/link";

import { ClientCard } from "./ClientCard";

import { Search, Plus } from "lucide-react";

import ClientsLoader from "../loader/ClientsLoader";
import DashboardHeader from "../common/Header";

interface Client {
    id: number;
    name: string;
    description: string | null;
    image: string;
}

export default function ClientsPage() {
    const toast = useToasts();

    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get("/api/clients");

            if (response.data.success) {
                setClients(response.data.data);
            } else {
                toast.error("Failed to load clients");
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
            toast.error("Failed to load clients");
        } finally {
            setLoading(false);
        }
    };

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
                        setClients(clients.filter((client) => client.id !== id));

                        toast.success("Client deleted successfully!");
                    } else {
                        toast.error(response.data.message || "Failed to delete client");
                    }
                } catch (error) {
                    console.error("Error deleting client:", error);
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Clients" description={`Manage your clients (${filteredClients.length} total)`} />

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

    return (
        <div className="">
            {/* Header */}
            <div className="pb-6 border-b">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <DashboardHeader title="Clients" description={`Manage your clients (${filteredClients.length} total)`} />
                    </div>

                    <Button asChild>
                        <Link href="/dashboard/clients/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Client
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 mt-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                </div>
            </div>

            {/* Clients Grid */}
            <div className="pt-6">
                {filteredClients.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredClients.map((client) => (
                            <ClientCard key={client.id} {...client} onDelete={handleDelete} />
                        ))}
                    </div>
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
