import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer/Footer";
import Navbar from "@/components/layout/navbar/Navbar";

export const metadata = {
    title: "404 - Page Not Found",
    description: "The page you're looking for doesn't exist.",
};

export default function NotFoundWithLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Main Content */}
            <main className="">
                <div className="w-full h-16 bg-footer-bg"></div>
                <div className="flex-1 flex items-center justify-center px-4 py-24">
                    <div className="max-w-2xl w-full text-center space-y-8">
                        {/* 404 Content */}
                        <div className="space-y-4">
                            <h1 className="text-7xl font-bold text-slate-900">404</h1>
                            <h2 className="text-3xl font-semibold text-slate-700">Oops! Page Not Found</h2>
                            <p className="text-lg text-slate-600 max-w-lg mx-auto">The page you're trying to access doesn't exist. It might have been moved or deleted.</p>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                                <Link href="/">← Back to Home</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/services">Browse Services</Link>
                            </Button>
                        </div>

                        {/* Quick Links */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-slate-200">
                            <Link href="/blogs" className="p-4 rounded-lg hover:bg-slate-50 transition-colors">
                                <h3 className="font-semibold text-slate-900 mb-2">Blog</h3>
                                <p className="text-sm text-slate-600">Read our latest articles and insights</p>
                            </Link>
                            <Link href="/services" className="p-4 rounded-lg hover:bg-slate-50 transition-colors">
                                <h3 className="font-semibold text-slate-900 mb-2">Services</h3>
                                <p className="text-sm text-slate-600">Explore what we offer</p>
                            </Link>
                            <Link href="/contact" className="p-4 rounded-lg hover:bg-slate-50 transition-colors">
                                <h3 className="font-semibold text-slate-900 mb-2">Contact</h3>
                                <p className="text-sm text-slate-600">Get in touch with us</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
