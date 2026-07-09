// components/dashboard/layout/contacts/ContactsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";
import { ContactsTable } from "./ContactsTable";
import { Loader2, Mail, RefreshCw, Download, Filter } from "lucide-react";

export type ContactSubmission = {
    id: number;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: "NEW" | "READ";
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
};

type PaginationInfo = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export default function ContactsPage() {
    const toast = useToasts();

    const [contacts, setContacts] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "NEW" | "READ">("ALL");
    const [sortBy, setSortBy] = useState("latest");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });

    useEffect(() => {
        fetchContacts();
    }, [search, statusFilter, sortBy, currentPage, itemsPerPage]);

    const fetchContacts = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                sortBy,
            });

            if (search) params.append("search", search);
            if (statusFilter !== "ALL") params.append("status", statusFilter);

            const response = await fetch(`/api/contacts?${params}`);
            const result = await response.json();

            if (result.success) {
                setContacts(result.data);
                setPagination(result.pagination);
            } else {
                toast.error("Failed to load contact submissions");
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
            toast.error("Failed to load contact submissions");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchContacts(false);
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            const response = await fetch(`/api/contacts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "READ" }),
            });

            const result = await response.json();
            if (result.success) {
                toast.success("Marked as read");
                fetchContacts(false);
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: number) => {
        const contactToDelete = contacts.find((c) => c.id === id);
        toast.message({
            text: `Delete submission from "${contactToDelete?.name}"?`,
            preserve: true,
            action: "Delete",
            onAction: async () => {
                try {
                    const response = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
                    const result = await response.json();

                    if (result.success) {
                        toast.success("Contact submission deleted");
                        fetchContacts(false);
                    } else {
                        toast.error(result.error || "Failed to delete submission");
                    }
                } catch (error) {
                    console.error("Delete error:", error);
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.append("status", statusFilter);

            const response = await fetch(`/api/contacts/export?${params}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `contact-submissions-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Export completed!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export data");
        } finally {
            setExporting(false);
        }
    };

    const newCount = contacts.filter((c) => c.status === "NEW").length;

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Mail className="h-4.5 w-4.5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">Contact Submissions</h1>
                            <p className="text-sm text-slate-500">
                                {pagination.total} total submissions
                                {newCount > 0 && <span className="ml-2 text-amber-600 font-medium">• {newCount} new</span>}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </button>

                        <button
                            onClick={handleExport}
                            disabled={exporting || contacts.length === 0}
                            className="flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
                        >
                            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Input
                            placeholder="Search by name, email, phone, or message..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="max-w-sm h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white"
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as "ALL" | "NEW" | "READ");
                                setCurrentPage(1);
                            }}
                            className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        >
                            <option value="ALL">All Status</option>
                            <option value="NEW">New</option>
                            <option value="READ">Read</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        >
                            <option value="latest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                        </select>

                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none ml-auto"
                        >
                            <option value={10}>10 per page</option>
                            <option value={15}>15 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>

                {/* Contacts Table */}
                <ContactsTable
                    contacts={contacts}
                    loading={loading}
                    pagination={pagination}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}
