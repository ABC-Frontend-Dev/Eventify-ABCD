"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-4 py-12">
            <div className="max-w-md w-full text-center space-y-6">
                {/* 404 Content */}
                <div className="space-y-2">
                    <h1 className="text-6xl font-bold text-slate-900">404</h1>
                    <p className="text-2xl font-semibold text-slate-700">Page Not Found</p>
                </div>

                <p className="text-slate-600">Sorry, the page you're looking for doesn't exist or has been moved. Please check the URL and try again.</p>

                {/* Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild size="lg">
                        <Link href="/">Go Home</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/services">Our Services</Link>
                    </Button>
                </div>

                {/* Additional Help */}
                <div className="pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-4">Looking for something specific?</p>
                    <ul className="text-sm text-slate-600 space-y-2">
                        <li>
                            <Link href="/blogs" className="text-blue-600 hover:underline">
                                Read Our Blog
                            </Link>
                        </li>
                        <li>
                            <Link href="/" className="text-blue-600 hover:underline">
                                Back to Home
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
