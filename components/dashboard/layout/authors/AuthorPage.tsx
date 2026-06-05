"use client";

import { useState, useEffect } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";

import Link from "next/link";

import { AuthorCard } from "./AuthorCard";

import { Search, Plus } from "lucide-react";

import ClientsLoader from "../loader/ClientsLoader";
import DashboardHeader from "../common/Header";

interface Author {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    avatar: string | null;
}

export default function AuthorPage() {
    const toast = useToasts();

    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        try {
            const response = await axios.get("/api/authors");

            if (response.data.success) {
                setAuthors(response.data.data);
            } else {
                toast.error("Failed to load authors");
            }
        } catch (error) {
            console.error("Error fetching authors:", error);
            toast.error("Failed to load authors");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const authorToDelete = authors.find((a) => a.id === id);

        toast.message({
            text: `Delete "${authorToDelete?.name}"?`,
            preserve: true,
            action: "Delete",

            onAction: async () => {
                try {
                    const response = await axios.delete(`/api/authors/${id}`);

                    if (response.data.success) {
                        setAuthors(authors.filter((author) => author.id !== id));

                        toast.success("Author deleted successfully!");
                    } else {
                        toast.error(response.data.message || "Failed to delete author");
                    }
                } catch (error) {
                    console.error("Error deleting author:", error);
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    const filteredAuthors = authors.filter((author) => author.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Authors" description={`Manage your authors (${filteredAuthors.length} total)`} />

                    <Button asChild>
                        <Link href="/dashboard/authors/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Author
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
                        <DashboardHeader title="Authors" description={`Manage your authors (${filteredAuthors.length} total)`} />
                    </div>

                    <Button asChild>
                        <Link href="/dashboard/authors/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Author
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 mt-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input placeholder="Search authors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                </div>
            </div>

            {/* Authors Grid */}
            <div className="pt-6">
                {filteredAuthors.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredAuthors.map((author) => (
                            <AuthorCard key={author.id} {...author} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">{searchQuery ? "No authors found matching your search" : "No authors found"}</p>

                        <Button asChild>
                            <Link href="/dashboard/authors/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Author
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
