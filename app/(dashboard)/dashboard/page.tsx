// app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, FolderKanban, Mail, TrendingUp, FileText, Tag, Eye, Loader2, RefreshCw, MailOpen, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────
interface Blog {
    id: number;
    title: string;
    slug: string;
    description: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    createdAt: string;
    updatedAt: string;
    category: { id: number; name: string };
    author: { id: number; name: string };
}

interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    status: "NEW" | "READ";
    submittedAt: string;
}

interface DashboardStats {
    // blogs
    totalBlogs: number;
    publishedBlogs: number;
    draftBlogs: number;
    // clients
    totalClients: number;
    // projects
    totalProjects: number;
    totalProjectCategories: number;
    // contacts
    totalContacts: number;
    newContacts: number;
    // blog categories
    totalBlogCategories: number;
}

// ── Helpers ───────────────────────────────────────────────
function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(dateStr));
}

function truncate(text: string, max: number) {
    return text.length <= max ? text : text.slice(0, max) + "…";
}

const STATUS_STYLES = {
    PUBLISHED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    DRAFT: "bg-amber-100 text-amber-700 border border-amber-200",
    ARCHIVED: "bg-slate-100 text-slate-500 border border-slate-200",
};

// ── Stat Row Item ─────────────────────────────────────────
function StatRow({ label, value, loading, highlight }: { label: string; value: number; loading: boolean; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-slate-500">{label}</span>
            {loading ? (
                <div className="h-4 w-10 animate-pulse rounded bg-slate-100" />
            ) : (
                <span className={`text-sm font-bold ${highlight ? "text-blue-600" : "text-slate-800"}`}>{String(value).padStart(2, "0")}</span>
            )}
        </div>
    );
}

// ── Summary Card ──────────────────────────────────────────
function SummaryCard({
    title,
    icon: Icon,
    iconBg,
    iconColor,
    badge,
    href,
    children,
}: {
    title: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    badge?: React.ReactNode;
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="border-slate-200 shadow-sm shadow-slate-100">
            <CardContent className="pt-4 pb-4">
                {/* Card header row */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
                            <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
                        </div>
                        <span className="text-base font-semibold text-slate-800">{title}</span>
                        {badge}
                    </div>
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1 text-slate-400 hover:text-slate-800 px-2">
                        <Link href={href}>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 mb-2" />

                {/* Stat rows */}
                <div className="space-y-0.5">{children}</div>
            </CardContent>
        </Card>
    );
}

// ── Main Page ─────────────────────────────────────────────
export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        totalClients: 0,
        totalProjects: 0,
        totalProjectCategories: 0,
        totalContacts: 0,
        newContacts: 0,
        totalBlogCategories: 0,
    });

    const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
    const [recentContacts, setRecentContacts] = useState<Contact[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAll = async () => {
        try {
            const [blogsRes, clientsRes, projectsRes, projectCatsRes, blogCatsRes, contactsRes] = await Promise.all([
                fetch("/api/blogs?sortBy=latest"),
                fetch("/api/clients"),
                fetch("/api/projects"),
                fetch("/api/project-categories"),
                fetch("/api/blog-categories"),
                fetch("/api/contacts?limit=5&sortBy=latest"),
            ]);

            const [blogsData, clientsData, projectsData, projectCatsData, blogCatsData, contactsData] = await Promise.all([
                blogsRes.json(),
                clientsRes.json(),
                projectsRes.json(),
                projectCatsRes.json(),
                blogCatsRes.json(),
                contactsRes.json(),
            ]);

            const blogs: Blog[] = blogsData.success ? blogsData.data : [];
            const clients = clientsData.success ? clientsData.data : [];
            const projects = projectsData.success ? projectsData.data : [];
            const projectCats = projectCatsData.success ? projectCatsData.data : [];
            const blogCats = blogCatsData.success ? blogCatsData.data : [];
            const contacts: Contact[] = contactsData.success ? contactsData.data : [];

            setRecentBlogs(blogs.slice(0, 5));
            setRecentContacts(contacts);

            setStats({
                totalBlogs: blogs.length,
                publishedBlogs: blogs.filter((b) => b.status === "PUBLISHED").length,
                draftBlogs: blogs.filter((b) => b.status === "DRAFT").length,
                totalClients: clients.length,
                totalProjects: projects.length,
                totalProjectCategories: projectCats.length,
                totalContacts: contactsData.success ? contactsData.pagination.total : 0,
                newContacts: contacts.filter((c) => c.status === "NEW").length,
                totalBlogCategories: blogCats.length,
            });
        } catch (e) {
            console.error("Dashboard fetch error:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAll();
    };

    return (
        <div className="space-y-6">
            {/* ── Page Header ─────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Welcome back! Here's a quick summary.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="h-9 gap-2">
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* ── Col 1 — Summary Cards ────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                {/* Row 1 — Blogs */}
                <SummaryCard title="Blogs" icon={BookOpen} iconBg="bg-blue-50" iconColor="text-blue-600" href="/dashboard/blogs">
                    <StatRow label="Total Blogs" value={stats.totalBlogs} loading={loading} />
                    <StatRow label="Published" value={stats.publishedBlogs} loading={loading} highlight />
                    <StatRow label="Draft" value={stats.draftBlogs} loading={loading} />
                    <StatRow label="Categories" value={stats.totalBlogCategories} loading={loading} />
                </SummaryCard>

                {/* Row 2 — Clients */}
                <SummaryCard title="Clients" icon={Users} iconBg="bg-purple-50" iconColor="text-purple-600" href="/dashboard/clients">
                    <StatRow label="Total Clients" value={stats.totalClients} loading={loading} highlight />
                </SummaryCard>

                {/* Row 3 — Projects */}
                <SummaryCard title="Projects" icon={FolderKanban} iconBg="bg-emerald-50" iconColor="text-emerald-600" href="/dashboard/projects">
                    <StatRow label="Total Projects" value={stats.totalProjects} loading={loading} highlight />
                    <StatRow label="Project Categories" value={stats.totalProjectCategories} loading={loading} />
                </SummaryCard>
            </div>

            {/* ── Bottom Grid — Recent Blogs + Contact Messages ── */}
            <div className="grid gap-6 lg:grid-cols-5">
                {/* Recent Blogs — 3 cols */}
                <div className="lg:col-span-3">
                    <Card className="border-slate-200 shadow-sm shadow-slate-100 h-full">
                        <CardContent className="pt-4 pb-2">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4.5 w-4.5 text-slate-400" />
                                    <span className="text-base font-semibold text-slate-800">Recent Blog Posts</span>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1 text-slate-400 hover:text-slate-800 px-2">
                                    <Link href="/dashboard/blogs">
                                        View all
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="border-t border-slate-100 mb-1" />

                            {/* List */}
                            {loading ? (
                                <div className="py-10 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                </div>
                            ) : recentBlogs.length === 0 ? (
                                <div className="py-10 text-center">
                                    <FileText className="h-9 w-9 text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400">No blog posts yet</p>
                                    <Button asChild size="sm" className="mt-3">
                                        <Link href="/dashboard/blogs/new">Create your first post</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {recentBlogs.map((blog) => (
                                        <div key={blog.id} className="flex items-start gap-3 py-3 group">
                                            {/* Icon */}
                                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
                                                <FileText className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{blog.title}</p>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLES[blog.status]}`}>{blog.status}</span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-slate-400 truncate">{truncate(blog.description, 65)}</p>
                                                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Tag className="h-3 w-3" />
                                                        {blog.category.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(blog.updatedAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <Link href={`/dashboard/blogs/${blog.id}/edit`}>
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Messages — 2 cols */}
                <div className="lg:col-span-2">
                    <Card className="border-slate-200 shadow-sm shadow-slate-100 h-full">
                        <CardContent className="pt-4 pb-2">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4.5 w-4.5 text-slate-400" />
                                    <span className="text-base font-semibold text-slate-800">Contact Messages</span>
                                    {stats.newContacts > 0 && (
                                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                                            {stats.newContacts}
                                        </span>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1 text-slate-400 hover:text-slate-800 px-2">
                                    <Link href="/dashboard/contacts">
                                        View all
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="border-t border-slate-100 mb-1" />

                            {/* List */}
                            {loading ? (
                                <div className="py-10 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                </div>
                            ) : recentContacts.length === 0 ? (
                                <div className="py-10 text-center">
                                    <Mail className="h-9 w-9 text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400">No messages yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {recentContacts.map((contact) => (
                                        <div key={contact.id} className="flex items-start gap-3 py-3 group">
                                            {/* Avatar */}
                                            <div
                                                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                    contact.status === "NEW" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                                                {contact.name.charAt(0).toUpperCase()}
                                                {contact.status === "NEW" && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 border-2 border-white" />}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <p className={`text-sm truncate ${contact.status === "NEW" ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>{contact.name}</p>
                                                    <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(contact.submittedAt)}</span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-slate-400 truncate">{contact.email}</p>
                                                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{truncate(contact.message, 75)}</p>
                                            </div>

                                            {/* Status icon */}
                                            <div className="shrink-0 mt-0.5">
                                                {contact.status === "NEW" ? <Mail className="h-3.5 w-3.5 text-amber-500" /> : <MailOpen className="h-3.5 w-3.5 text-slate-300" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
