// components/dashboard/layout/contacts/ContactsTable.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Trash2, Mail, MailOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { ContactSubmission } from "./ContactsPage";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type PaginationInfo = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

interface ContactsTableProps {
    contacts: ContactSubmission[];
    loading: boolean;
    pagination: PaginationInfo;
    currentPage: number;
    onPageChange: (page: number) => void;
    onMarkAsRead: (id: number) => void;
    onDelete: (id: number) => void;
}

export function ContactsTable({ contacts, loading, pagination, currentPage, onPageChange, onMarkAsRead, onDelete }: ContactsTableProps) {
    const [viewingContact, setViewingContact] = useState<ContactSubmission | null>(null);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleView = (contact: ContactSubmission) => {
        setViewingContact(contact);
        if (contact.status === "NEW") {
            onMarkAsRead(contact.id);
        }
    };

    if (loading) {
        return (
            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                <CardContent className="p-12">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (contacts.length === 0) {
        return (
            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                <CardContent className="p-12">
                    <div className="text-center">
                        <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No contact submissions found</h3>
                        <p className="text-sm text-slate-500">Contact submissions will appear here when users fill out the form</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                <CardHeader className="border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-slate-900">Contact Submissions</h3>
                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                            <span className="text-sm font-semibold text-purple-900">
                                Showing {(currentPage - 1) * pagination.limit + 1}-{Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 hover:bg-slate-50/50">
                                    <TableHead className="w-16 font-semibold text-slate-700">ID</TableHead>
                                    <TableHead className="font-semibold text-slate-700 min-w-[150px]">Name</TableHead>
                                    <TableHead className="font-semibold text-slate-700 min-w-[200px]">Email</TableHead>
                                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Phone</TableHead>
                                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Date</TableHead>
                                    <TableHead className="font-semibold text-slate-700 min-w-[100px]">Time</TableHead>
                                    <TableHead className="font-semibold text-slate-700 w-24">Status</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-700 w-40">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contacts.map((contact) => (
                                    <TableRow key={contact.id} className={`border-slate-200 hover:bg-slate-50/80 transition-colors ${contact.status === "NEW" ? "bg-amber-50/30" : ""}`}>
                                        <TableCell className="font-medium text-slate-600">#{contact.id}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {contact.status === "NEW" && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
                                                <span className="font-semibold text-slate-900">{contact.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-600 text-sm">{contact.email}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-600 text-sm">{contact.phone}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-600 text-sm">{formatDate(contact.submittedAt)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-600 text-sm">{formatTime(contact.submittedAt)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    contact.status === "NEW" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                                                }`}
                                            >
                                                {contact.status === "NEW" ? <Mail className="h-3 w-3" /> : <MailOpen className="h-3 w-3" />}
                                                {contact.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleView(contact)}
                                                    className="h-9 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onDelete(contact.id)}
                                                    className="h-9 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                            <div className="text-sm text-slate-600">
                                Page {currentPage} of {pagination.totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="h-9">
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages} className="h-9">
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Contact Dialog */}
            <Dialog open={viewingContact !== null} onOpenChange={() => setViewingContact(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Contact Submission Details</DialogTitle>
                    </DialogHeader>
                    {viewingContact && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Name</label>
                                    <p className="mt-1 text-slate-900">{viewingContact.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Status</label>
                                    <p className="mt-1">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                viewingContact.status === "NEW" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                                            }`}
                                        >
                                            {viewingContact.status === "NEW" ? <Mail className="h-3 w-3" /> : <MailOpen className="h-3 w-3" />}
                                            {viewingContact.status}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <p className="mt-1 text-slate-900">{viewingContact.email}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Phone</label>
                                <p className="mt-1 text-slate-900">{viewingContact.phone}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Message</label>
                                <p className="mt-1 text-slate-900 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-200">{viewingContact.message}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Submitted Date</label>
                                    <p className="mt-1 text-slate-900">{formatDate(viewingContact.submittedAt)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Submitted Time</label>
                                    <p className="mt-1 text-slate-900">{formatTime(viewingContact.submittedAt)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
