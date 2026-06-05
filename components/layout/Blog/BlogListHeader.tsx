// components/layout/Blog/BlogListHeader.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RadioGroup } from "@/components/ui/radio";
import { Search } from "lucide-react";

interface Category {
    id: number;
    name: string;
}

interface BlogListHeaderProps {
    categories: Category[];
}

export default function BlogListHeader() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
            params.set("search", searchQuery);
        } else {
            params.delete("search");
        }
        router.push(`/blog?${params.toString()}`);
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        const params = new URLSearchParams(searchParams.toString());
        if (categoryId) {
            params.set("category", categoryId);
        } else {
            params.delete("category");
        }
        router.push(`/blog?${params.toString()}`);
    };

    return (
        <div className="flex items-start justify-between">
            <div>
                <div className="text-[40px] leading-10 font-helvetica font-bold tracking-wide">Blog</div>
                <Breadcrumb props={{ className: "mt-3.5" }} />
            </div>

            <div className="flex items-center gap-7.5">
                <div className="text-lg leading-4 text-footer-bg">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-147 h-15 pl-14.25 pr-5.75 py-5.75 font-helvetica font-light rounded-[4px] overflow-hidden bg-slate-50 border border-slate-200 placeholder:text-slate-400 placeholder:text-[20px] placeholder:font-light placeholder:font-helvetica outline-none"
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Search className="h-8 w-8 text-footer-bg" />
                        </button>
                    </form>
                </div>

                <div className="">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-62 h-15 bg-slate-50 border border-slate-200 p-3.5 rounded-[4px] overflow-hidden cursor-pointer flex items-center justify-between">
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
                        <DropdownMenuContent align="end" className="p-0 bg-slate-50 border border-slate-200 rounded-[4px] outline-none overflow-hidden">
                            <form className="flex flex-col gap-6 items-start outline-none">
                                <RadioGroup label="Filter by Category" onChange={handleCategoryChange} value={selectedCategory}>
                                    <div className="flex flex-col w-full">
                                        <DropdownMenuItem className="cursor-pointer p-3.25 font-product-sans-medium text-[20px] capitalize hover:bg-slate-100 transition-colors duration-100 border-b border-slate-200">
                                            <RadioGroup.Item value="">All Categories</RadioGroup.Item>
                                        </DropdownMenuItem>
                                        {categories.map((category) => (
                                            <DropdownMenuItem
                                                key={category.id}
                                                className="cursor-pointer p-3.25 font-product-sans-medium text-[20px] capitalize hover:bg-slate-100 transition-colors duration-100 border-b border-slate-200 last:border-0"
                                            >
                                                <RadioGroup.Item value={category.id.toString()}>{category.name}</RadioGroup.Item>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </form>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
