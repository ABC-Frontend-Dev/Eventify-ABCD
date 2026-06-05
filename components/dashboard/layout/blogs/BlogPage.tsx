// components/dashboard/layout/blogs/BlogPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useDebounce } from "@/hooks/use-debounce"; // We'll create this

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToasts } from "@/components/ui/toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import Link from "next/link";

import { BlogCard } from "./BlogCard";

import { Search, Plus, Filter, X, SlidersHorizontal, Loader2 } from "lucide-react";

import ClientsLoader from "../loader/ClientsLoader";
import DashboardHeader from "../common/Header";

enum BlogStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}

interface Blog {
    id: number;
    title: string;
    slug: string;
    description: string;
    banner_image: string;
    status: BlogStatus;
    createdAt: string;
    updatedAt: string;
    author: {
        id: number;
        name: string;
    };
    category: {
        id: number;
        name: string;
    };
}

interface Category {
    id: number;
    name: string;
}

interface Author {
    id: number;
    name: string;
}

type SortOption = "latest" | "oldest" | "title-asc" | "title-desc";

export default function BlogPage() {
    const toast = useToasts();

    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState<BlogStatus | "ALL">("ALL");
    const [selectedCategory, setSelectedCategory] = useState<number | "ALL">("ALL");
    const [selectedAuthor, setSelectedAuthor] = useState<number | "ALL">("ALL");
    const [sortBy, setSortBy] = useState<SortOption>("latest");

    // Debounce search query
    const debouncedSearch = useDebounce(searchQuery, 500);

    // Initial data load
    useEffect(() => {
        fetchCategoriesAndAuthors();
    }, []);

    // Fetch blogs when filters change
    useEffect(() => {
        fetchBlogs();
    }, [debouncedSearch, selectedStatus, selectedCategory, selectedAuthor, sortBy]);

    const fetchCategoriesAndAuthors = async () => {
        try {
            const [categoriesRes, authorsRes] = await Promise.all([axios.get("/api/blog-categories"), axios.get("/api/authors")]);

            if (categoriesRes.data.success) {
                setCategories(categoriesRes.data.data);
            }

            if (authorsRes.data.success) {
                setAuthors(authorsRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load filters");
        }
    };

    const fetchBlogs = async () => {
        if (!loading) {
            setSearching(true);
        }

        try {
            // Build query params
            const params = new URLSearchParams();

            if (debouncedSearch) {
                params.append("search", debouncedSearch);
            }
            if (selectedStatus !== "ALL") {
                params.append("status", selectedStatus);
            }
            if (selectedCategory !== "ALL") {
                params.append("categoryId", selectedCategory.toString());
            }
            if (selectedAuthor !== "ALL") {
                params.append("authorId", selectedAuthor.toString());
            }
            params.append("sortBy", sortBy);

            const response = await axios.get(`/api/blogs?${params.toString()}`);

            if (response.data.success) {
                setBlogs(response.data.data);
            } else {
                toast.error("Failed to load blogs");
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Failed to load blogs");
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    const handleDelete = async (id: number) => {
        const blogToDelete = blogs.find((b) => b.id === id);

        toast.message({
            text: `Delete "${blogToDelete?.title}"?`,
            preserve: true,
            action: "Delete",

            onAction: async () => {
                try {
                    const response = await axios.delete(`/api/blogs/${id}`);

                    if (response.data.success) {
                        // Refresh blogs after delete
                        fetchBlogs();
                        toast.success("Blog deleted successfully!");
                    } else {
                        toast.error(response.data.message || "Failed to delete blog");
                    }
                } catch (error) {
                    console.error("Error deleting blog:", error);
                    toast.error("An error occurred while deleting");
                }
            },
        });
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedStatus("ALL");
        setSelectedCategory("ALL");
        setSelectedAuthor("ALL");
        setSortBy("latest");
        setSearchQuery("");
    };

    // Check if any filter is active
    const hasActiveFilters = selectedStatus !== "ALL" || selectedCategory !== "ALL" || selectedAuthor !== "ALL" || sortBy !== "latest" || searchQuery !== "";

    if (loading) {
        return (
            <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <DashboardHeader title="Blogs" description="Manage your blogs" />

                    <Button asChild>
                        <Link href="/dashboard/blogs/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Blog
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
                        <DashboardHeader title="Blogs" description={`Manage your blogs (${blogs.length} ${hasActiveFilters ? "filtered" : "total"})`} />
                    </div>

                    <Button asChild>
                        <Link href="/dashboard/blogs/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Blog
                        </Link>
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search blogs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                        {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Status
                                    {selectedStatus !== "ALL" && (
                                        <Badge variant="secondary" className="ml-2 h-5 px-1">
                                            1
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSelectedStatus("ALL")} className={selectedStatus === "ALL" ? "bg-accent" : ""}>
                                    All Statuses
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedStatus(BlogStatus.PUBLISHED)} className={selectedStatus === BlogStatus.PUBLISHED ? "bg-accent" : ""}>
                                    Published
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedStatus(BlogStatus.DRAFT)} className={selectedStatus === BlogStatus.DRAFT ? "bg-accent" : ""}>
                                    Draft
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedStatus(BlogStatus.ARCHIVED)} className={selectedStatus === BlogStatus.ARCHIVED ? "bg-accent" : ""}>
                                    Archived
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Category Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Category
                                    {selectedCategory !== "ALL" && (
                                        <Badge variant="secondary" className="ml-2 h-5 px-1">
                                            1
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSelectedCategory("ALL")} className={selectedCategory === "ALL" ? "bg-accent" : ""}>
                                    All Categories
                                </DropdownMenuItem>
                                {categories.map((category) => (
                                    <DropdownMenuItem key={category.id} onClick={() => setSelectedCategory(category.id)} className={selectedCategory === category.id ? "bg-accent" : ""}>
                                        {category.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Author Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Author
                                    {selectedAuthor !== "ALL" && (
                                        <Badge variant="secondary" className="ml-2 h-5 px-1">
                                            1
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Filter by Author</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSelectedAuthor("ALL")} className={selectedAuthor === "ALL" ? "bg-accent" : ""}>
                                    All Authors
                                </DropdownMenuItem>
                                {authors.map((author) => (
                                    <DropdownMenuItem key={author.id} onClick={() => setSelectedAuthor(author.id)} className={selectedAuthor === author.id ? "bg-accent" : ""}>
                                        {author.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Sort Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    Sort
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSortBy("latest")} className={sortBy === "latest" ? "bg-accent" : ""}>
                                    Latest First
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy("oldest")} className={sortBy === "oldest" ? "bg-accent" : ""}>
                                    Oldest First
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy("title-asc")} className={sortBy === "title-asc" ? "bg-accent" : ""}>
                                    Title (A-Z)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy("title-desc")} className={sortBy === "title-desc" ? "bg-accent" : ""}>
                                    Title (Z-A)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-muted-foreground">
                                <X className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-sm text-muted-foreground">Active filters:</span>
                        {selectedStatus !== "ALL" && (
                            <Badge variant="secondary" className="gap-1">
                                Status: {selectedStatus}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStatus("ALL")} />
                            </Badge>
                        )}
                        {selectedCategory !== "ALL" && (
                            <Badge variant="secondary" className="gap-1">
                                Category: {categories.find((c) => c.id === selectedCategory)?.name}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("ALL")} />
                            </Badge>
                        )}
                        {selectedAuthor !== "ALL" && (
                            <Badge variant="secondary" className="gap-1">
                                Author: {authors.find((a) => a.id === selectedAuthor)?.name}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedAuthor("ALL")} />
                            </Badge>
                        )}
                        {searchQuery && (
                            <Badge variant="secondary" className="gap-1">
                                Search: "{searchQuery}"
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            {/* Blogs Grid */}
            <div className="pt-6">
                {searching && blogs.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {blogs.map((blog) => (
                            <BlogCard key={blog.id} {...blog} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{hasActiveFilters ? "No blogs match your filters" : "No blogs found"}</h3>
                        <p className="text-muted-foreground mb-4 text-center max-w-sm">
                            {hasActiveFilters ? "Try adjusting your filters or search query" : "Get started by creating your first blog post"}
                        </p>

                        {hasActiveFilters ? (
                            <Button onClick={clearFilters} variant="outline">
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link href="/dashboard/blogs/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Blog
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
