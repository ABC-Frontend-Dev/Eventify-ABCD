"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BlogNotFound() {
    return (
        <section className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-6xl font-bold text-slate-900">404</h1>
                    <p className="text-2xl font-semibold text-slate-700">Blog Post Not Found</p>
                </div>

                <p className="text-slate-600">Sorry, the blog post you're looking for doesn't exist or has been deleted.</p>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild size="lg">
                        <Link href="/">Go Home</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/blogs">All Blogs</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
