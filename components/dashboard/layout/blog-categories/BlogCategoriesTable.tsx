// components/dashboard/layout/categories/CategoriesTable.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";
import ProjectCategoriesTableLoader from "../loader/ProjectCategoriesTableLoader";

interface BlogCategory {
    id: number;
    name: string;
    description: string | null;
}

interface CategoriesTableProps {
    categories: BlogCategory[];
    loading: boolean;
    onEdit: (category: BlogCategory) => void;
    onDelete: (id: number) => void;
}

export function ProjectCategoriesTable({ categories, loading, onEdit, onDelete }: CategoriesTableProps) {
    if (loading) {
        return <ProjectCategoriesTableLoader />;
    }

    if (categories.length === 0) {
        return <ProjectCategoriesTableLoader />;
    }

    return (
        <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
            <CardHeader className="border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900">All Categories</h3>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                        <span className="text-sm font-semibold text-purple-900">
                            {categories.length} {categories.length === 1 ? "Category" : "Categories"}
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
                                <TableHead className="font-semibold text-slate-700 min-w-50">Name</TableHead>
                                <TableHead className="font-semibold text-slate-700 min-w-75">Description</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700 w-32">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category, index) => (
                                <TableRow key={category.id} className="border-slate-200 hover:bg-slate-50/80 transition-colors">
                                    <TableCell className="font-medium text-slate-600">#{category.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">{category.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {category.description ? (
                                            <span className="text-slate-600 text-sm line-clamp-2">{category.description}</span>
                                        ) : (
                                            <span className="text-slate-400 text-sm italic">No description provided</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onEdit(category)}
                                                className="h-9 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onDelete(category.id)}
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
            </CardContent>
        </Card>
    );
}
