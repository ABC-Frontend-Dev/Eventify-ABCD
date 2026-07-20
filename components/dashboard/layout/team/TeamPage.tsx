"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";
import { Search, Plus } from "lucide-react";

import { TeamCard } from "./TeamCard";
import DashboardHeader from "../common/Header";
import ClientsLoader from "../loader/ClientsLoader";

interface TeamMember {
    id: number;
    position: number;
    name: string;
    role: string;
    image: string;
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
                        setMembers(members.filter((m) => m.id !== id));
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

    const filteredMembers = members.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => a.position - b.position);

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Team" description={`Manage your team (${filteredMembers.length} total)`} />
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
            <div className="pb-6 border-b">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Team" description={`Manage your team (${filteredMembers.length} total)`} />
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

            <div className="pt-6">
                {filteredMembers.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {filteredMembers.map((member) => (
                            <TeamCard key={member.id} {...member} onDelete={handleDelete} />
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
        </div>
    );
}
