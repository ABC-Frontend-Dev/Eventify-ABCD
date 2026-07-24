// components/layout/Blog/BlogListHeader.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RadioGroup } from "@/components/ui/radio";
import { Search, Loader2 } from "lucide-react";

interface Category {
    id: number;
    name: string;
}

interface BlogSearchResult {
    id: number;
    slug: string;
    title: string;
    thumbnail: string;
}

interface BlogListHeaderProps {
    categories?: Category[];
    onSearchResults?: (results: BlogSearchResult[]) => void;
    onFiltersChange?: (search: string, category: string) => void;
}

export default function BlogListHeader({ onSearchResults, onFiltersChange }: BlogListHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
    const [searchResults, setSearchResults] = useState<BlogSearchResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Fetch categories
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/blog-categories");
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const performSearch = async (query: string) => {
        setLoadingSearch(true);
        try {
            const params = new URLSearchParams();
            params.append("search", query);
            params.append("limit", "5"); // Limit dropdown results to 5

            const response = await fetch(`/api/blogs?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setSearchResults(data.data);
                setShowSearchResults(true);
            }
        } catch (error) {
            console.error("Error searching blogs:", error);
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());

        if (searchQuery) {
            params.set("search", searchQuery);
        } else {
            params.delete("search");
        }

        router.push(`/blogs?${params.toString()}`);
        setShowSearchResults(false);
        onFiltersChange?.(searchQuery, selectedCategory);
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        const params = new URLSearchParams(searchParams.toString());

        if (categoryId) {
            params.set("category", categoryId);
        } else {
            params.delete("category");
        }

        router.push(`/blogs?${params.toString()}`);
        onFiltersChange?.(searchQuery, categoryId);
    };

    return (
        <div className="flex items-start justify-between flex-col lg:flex-row">
            <div>
                <div className="text-2xl lg:text-[40px] leading-7 lg:leading-10 font-helvetica font-bold tracking-wide">Blog</div>
                <Breadcrumb props={{ className: "mt-3.5" }} />
            </div>

            <div className="flex items-center gap-7.5">
                {/* Search Bar with Dropdown Results */}
                <div className="text-lg leading-4 text-footer-bg relative">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-147 h-15 pl-14.25 pr-5.75 py-5.75 font-helvetica font-light rounded-[4px] overflow-hidden bg-slate-50 border border-slate-200 placeholder:text-slate-400 placeholder:text-[20px] placeholder:font-light placeholder:font-helvetica outline-none focus:border-slate-400 transition-colors"
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Search className="h-8 w-8 text-footer-bg" />
                        </button>
                    </form>

                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute top-full mt-2 left-0 w-147 bg-white border border-slate-200 rounded-[4px] shadow-lg z-50 max-h-96 overflow-y-auto">
                            {searchResults.map((blog) => (
                                <Link
                                    key={blog.id}
                                    href={`/blogs/${blog.slug}`}
                                    onClick={() => setShowSearchResults(false)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors text-left"
                                >
                                    <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                                        <img src={blog.thumbnail} alt={blog.title} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{blog.title}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {showSearchResults && loadingSearch && (
                        <div className="absolute top-full mt-2 left-0 w-147 bg-white border border-slate-200 rounded-[4px] shadow-lg z-50 flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        </div>
                    )}

                    {showSearchResults && searchResults.length === 0 && !loadingSearch && searchQuery && (
                        <div className="absolute top-full mt-2 left-0 w-147 bg-white border border-slate-200 rounded-[4px] shadow-lg z-50 p-4">
                            <p className="text-sm text-slate-500 text-center">No blogs found</p>
                        </div>
                    )}
                </div>

                {/* Category Filter Dropdown */}
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-62 h-15 bg-slate-50 border border-slate-200 p-3.5 rounded-[4px] overflow-hidden cursor-pointer flex items-center justify-between hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3 w-fit">
                                <div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M2 5h20" />
                                        <path d="M6 12h12" />
                                        <path d="M9 19h6" />
                                    </svg>
                                </div>
                                <div className="font-product-sans-medium text-[20px] capitalize">filter</div>
                            </div>
                            <div className="w-fit">
                                <svg width="19" height="10" viewBox="0 0 19 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.75 0.75L9.25 9.25L17.75 0.750001" stroke="#020617" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="p-0 bg-slate-50 border border-slate-200 rounded-[4px] outline-none overflow-hidden w-62">
                            <div className="flex flex-col outline-none">
                                <DropdownMenuItem
                                    onClick={() => handleCategoryChange("")}
                                    className="cursor-pointer p-3.25 font-product-sans-medium text-[20px] capitalize hover:bg-slate-100 transition-colors duration-100 border-b border-slate-200"
                                >
                                    All Categories
                                </DropdownMenuItem>

                                {loadingCategories ? (
                                    <DropdownMenuItem disabled className="p-3.25">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </DropdownMenuItem>
                                ) : (
                                    categories.map((category) => (
                                        <DropdownMenuItem
                                            key={category.id}
                                            onClick={() => handleCategoryChange(category.id.toString())}
                                            className="cursor-pointer p-3.25 font-product-sans-medium text-[20px] capitalize hover:bg-slate-100 transition-colors duration-100 border-b border-slate-200 last:border-0"
                                        >
                                            <div className={`flex items-center gap-2 ${selectedCategory === category.id.toString() ? "text-primary font-bold" : ""}`}>
                                                {selectedCategory === category.id.toString() && "✓ "}
                                                {category.name}
                                            </div>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Password Change Modal */}
            {/* {showPasswordModal && (
                <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} userEmail={session?.user?.email || ""} />
            )} */}
        </div>
    );
}
