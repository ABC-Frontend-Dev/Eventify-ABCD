"use client";

import { useState, useEffect } from "react";
import { useToasts } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Users, Send, Trash2, History, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Download } from "lucide-react";
import DashboardHeader from "../common/Header";
import { TEMPLATES, type TemplateDefinition, type TemplateId } from "@/lib/newsletter-templates";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subscriber {
    id: number;
    email: string;
    subscribedAt: string;
    isActive: boolean;
    unsubscribedAt: string | null;
}

interface SendHistory {
    id: number;
    subject: string;
    templateId: string;
    recipientCount: number;
    sentAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const inp = "h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300";

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({ template, selected, onSelect }: { template: TemplateDefinition; selected: boolean; onSelect: () => void }) {
    const icons: Record<string, string> = {
        "event-announcement": "📅",
        "monthly-roundup": "📋",
        "award-celebration": "🏆",
        "blog-digest": "📰",
        "promotional-offer": "🎁",
    };

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300 bg-white"}`}
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{icons[template.id] || "📧"}</span>
                <div>
                    <p className={`text-sm font-semibold ${selected ? "text-primary" : "text-slate-800"}`}>{template.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{template.description}</p>
                </div>
                {selected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0 ml-auto mt-0.5" />}
            </div>
        </button>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NewsletterPage() {
    const toast = useToasts();

    // ── Tabs
    const [tab, setTab] = useState<"compose" | "subscribers" | "history">("compose");

    // ── Subscribers
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loadingSubscribers, setLoadingSubscribers] = useState(false);
    const [showInactive, setShowInactive] = useState(false);

    // ── History
    const [history, setHistory] = useState<SendHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // ── Compose
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(null);
    const [subject, setSubject] = useState("");
    const [templateData, setTemplateData] = useState<Record<string, string>>({});
    const [sending, setSending] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewHtml, setPreviewHtml] = useState("");

    // ── Load subscribers
    const loadSubscribers = async () => {
        setLoadingSubscribers(true);
        try {
            const res = await fetch(`/api/newsletter/subscribers?all=${showInactive}`);
            const result = await res.json();
            if (result.success) setSubscribers(result.data);
        } catch {
            toast.error("Failed to load subscribers");
        } finally {
            setLoadingSubscribers(false);
        }
    };

    // ── Load history
    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch("/api/newsletter/history");
            const result = await res.json();
            if (result.success) setHistory(result.data);
        } catch {
            toast.error("Failed to load history");
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (tab === "subscribers") loadSubscribers();
        if (tab === "history") loadHistory();
    }, [tab, showInactive]);

    // ── Select template
    const handleSelectTemplate = (template: TemplateDefinition) => {
        setSelectedTemplate(template);
        setTemplateData({});
        setPreviewOpen(false);
    };

    // ── Update field
    const handleFieldChange = (key: string, value: string) => {
        setTemplateData((prev) => ({ ...prev, [key]: value }));
    };

    // ── Preview
    const handlePreview = async () => {
        if (!selectedTemplate) return;

        try {
            const { renderTemplate } = await import("@/lib/newsletter-templates");
            const html = renderTemplate(selectedTemplate.id as TemplateId, templateData, "#unsubscribe-preview");
            if (html) {
                setPreviewHtml(html);
                setPreviewOpen(true);
            }
        } catch {
            toast.error("Failed to generate preview");
        }
    };

    // ── Send
    const handleSend = async () => {
        if (!selectedTemplate) {
            toast.warning("Please select a template");
            return;
        }
        if (!subject.trim()) {
            toast.warning("Please enter a subject line");
            return;
        }

        // Check required fields
        const missingFields = selectedTemplate.fields.filter((f) => f.required && !templateData[f.key]?.trim()).map((f) => f.label);

        if (missingFields.length > 0) {
            toast.warning(`Please fill in: ${missingFields.join(", ")}`);
            return;
        }

        toast.message({
            text: `Send newsletter to all active subscribers?`,
            preserve: true,
            action: "Send",
            onAction: async () => {
                setSending(true);
                try {
                    const res = await fetch("/api/newsletter/send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            subject,
                            templateId: selectedTemplate.id,
                            templateData,
                        }),
                    });
                    const result = await res.json();
                    if (result.success) {
                        toast.success(result.message);
                        setSubject("");
                        setTemplateData({});
                        setSelectedTemplate(null);
                    } else {
                        toast.error(result.error || "Failed to send newsletter");
                    }
                } catch {
                    toast.error("Something went wrong");
                } finally {
                    setSending(false);
                }
            },
        });
    };

    // ── Remove subscriber
    const handleRemoveSubscriber = async (id: number, email: string) => {
        toast.message({
            text: `Remove ${email}?`,
            preserve: true,
            action: "Remove",
            onAction: async () => {
                try {
                    const res = await fetch(`/api/newsletter/subscribers/${id}`, {
                        method: "DELETE",
                    });
                    const result = await res.json();
                    if (result.success) {
                        toast.success("Subscriber removed");
                        loadSubscribers();
                    } else {
                        toast.error("Failed to remove subscriber");
                    }
                } catch {
                    toast.error("Something went wrong");
                }
            },
        });
    };

    const handleExport = (format: "csv" | "xlsx") => {
        const params = new URLSearchParams({
            format,
            all: showInactive ? "true" : "false",
        });
        // Trigger browser download directly
        window.open(`/api/newsletter/subscribers/export?${params.toString()}`, "_blank");
    };

    const activeSubscribers = subscribers.filter((s) => s.isActive);

    return (
        <div>
            {/* Header */}
            <div className="pb-6 border-b">
                <DashboardHeader title="Newsletter" description={`Manage subscribers and send newsletters`} />
            </div>

            {/* Stats bar */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                    {
                        label: "Active Subscribers",
                        value: activeSubscribers.length,
                        icon: Users,
                        color: "text-emerald-600",
                        bg: "bg-emerald-50",
                    },
                    {
                        label: "Newsletters Sent",
                        value: history.length,
                        icon: Send,
                        color: "text-blue-600",
                        bg: "bg-blue-50",
                    },
                    {
                        label: "Templates",
                        value: TEMPLATES.length,
                        icon: Mail,
                        color: "text-primary",
                        bg: "bg-purple-50",
                    },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-[11px] text-slate-400">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200 mb-6">
                {(
                    [
                        { id: "compose", label: "Compose", icon: Mail },
                        { id: "subscribers", label: "Subscribers", icon: Users },
                        { id: "history", label: "Send History", icon: History },
                    ] as const
                ).map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                            tab === t.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        <t.icon className="h-3.5 w-3.5" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Compose tab ─────────────────────────────────────────────── */}
            {tab === "compose" && (
                <div className="flex flex-col xl:flex-row gap-5">
                    {/* Left: template picker + fields */}
                    <div className="flex-1 min-w-0 space-y-5">
                        {/* Subject */}
                        <section className="bg-white border border-slate-200 rounded-xl p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Email Subject</p>
                            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. July 2026 Newsletter — Eventify Updates" className={inp} />
                        </section>

                        {/* Template picker */}
                        <section className="bg-white border border-slate-200 rounded-xl p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Choose Template</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {TEMPLATES.map((t) => (
                                    <TemplateCard key={t.id} template={t} selected={selectedTemplate?.id === t.id} onSelect={() => handleSelectTemplate(t)} />
                                ))}
                            </div>
                        </section>

                        {/* Template fields */}
                        {selectedTemplate && (
                            <section className="bg-white border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{selectedTemplate.name} — Content</p>
                                    <Button type="button" variant="outline" size="sm" onClick={handlePreview} className="h-7 text-xs gap-1.5">
                                        <Eye className="h-3.5 w-3.5" />
                                        Preview
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {selectedTemplate.fields.map((field) => (
                                        <div key={field.key}>
                                            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                                                {field.label}
                                                {field.required && <span className="text-red-400">*</span>}
                                                {!field.required && <span className="text-[10px] text-slate-400 font-normal">(optional)</span>}
                                                {templateData[field.key]?.trim() && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />}
                                            </label>

                                            {field.type === "textarea" ? (
                                                <Textarea
                                                    value={templateData[field.key] || ""}
                                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    rows={3}
                                                    className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                                                />
                                            ) : (
                                                <Input
                                                    type={field.type}
                                                    value={templateData[field.key] || ""}
                                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className={inp}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right: sidebar */}
                    <aside className="w-full xl:w-64 shrink-0">
                        <div className="xl:sticky xl:top-[108px] space-y-4">
                            {/* Send card */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <p className="text-xs font-medium text-slate-600 mb-3">Ready to Send?</p>
                                <div className="space-y-2 mb-4">
                                    {[
                                        { label: "Subject set", ok: !!subject.trim() },
                                        {
                                            label: "Template selected",
                                            ok: !!selectedTemplate,
                                        },
                                        {
                                            label: "Required fields filled",
                                            ok: !!selectedTemplate && selectedTemplate.fields.filter((f) => f.required).every((f) => !!templateData[f.key]?.trim()),
                                        },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center gap-2">
                                            {item.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 text-slate-200 shrink-0" />}
                                            <span className={`text-[11px] ${item.ok ? "text-slate-600" : "text-slate-400"}`}>{item.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-3 border-t border-slate-100">
                                    <p className="text-[11px] text-slate-400 mb-3">
                                        Will send to <span className="font-semibold text-slate-700">{activeSubscribers.length} active</span> subscriber
                                        {activeSubscribers.length !== 1 ? "s" : ""}
                                    </p>
                                    <Button type="button" onClick={handleSend} disabled={sending} className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-white">
                                        {sending ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-3.5 w-3.5 mr-1.5" />
                                                Send Newsletter
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <p className="text-xs font-medium text-slate-600 mb-3">Tips</p>
                                <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                                    <li>Pick a template that matches your message</li>
                                    <li>Fill in all required fields</li>
                                    <li>Use Preview to check before sending</li>
                                    <li>Each subscriber gets a unique unsubscribe link</li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* ── Subscribers tab ──────────────────────────────────────────── */}
            {tab === "subscribers" && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800">
                            {showInactive ? "All" : "Active"} Subscribers ({subscribers.length})
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Export buttons */}
                            <button
                                type="button"
                                onClick={() => handleExport("csv")}
                                className="flex items-center gap-1.5 h-7 px-3 text-[11px] font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            >
                                <Download className="h-3 w-3" />
                                CSV
                            </button>
                            <button
                                type="button"
                                onClick={() => handleExport("xlsx")}
                                className="flex items-center gap-1.5 h-7 px-3 text-[11px] font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            >
                                <Download className="h-3 w-3" />
                                Excel
                            </button>

                            <div className="h-4 w-px bg-slate-200" />

                            {/* Toggle inactive */}
                            <button type="button" onClick={() => setShowInactive((v) => !v)} className="text-[11px] text-slate-500 hover:text-slate-700 underline underline-offset-2">
                                {showInactive ? "Show active only" : "Show all (incl. unsubscribed)"}
                            </button>
                        </div>
                    </div>

                    {loadingSubscribers ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : subscribers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Users className="h-8 w-8 text-slate-200 mb-2" />
                            <p className="text-sm text-slate-400">No subscribers yet</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-50">
                            {subscribers.map((sub) => (
                                <li key={sub.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full shrink-0 ${sub.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                                        <div>
                                            <p className="text-xs font-medium text-slate-800">{sub.email}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {sub.isActive ? `Subscribed ${formatDate(sub.subscribedAt)}` : `Unsubscribed ${sub.unsubscribedAt ? formatDate(sub.unsubscribedAt) : ""}`}
                                            </p>
                                        </div>
                                    </div>

                                    {sub.isActive && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSubscriber(sub.id, sub.email)}
                                            className="p-1.5 rounded-md text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* ── History tab ──────────────────────────────────────────────── */}
            {tab === "history" && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800">Send History</p>
                    </div>

                    {loadingHistory ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <History className="h-8 w-8 text-slate-200 mb-2" />
                            <p className="text-sm text-slate-400">No newsletters sent yet</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-50">
                            {history.map((h) => {
                                const template = TEMPLATES.find((t) => t.id === h.templateId);
                                return (
                                    <li key={h.id} className="flex items-center justify-between px-5 py-3">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800">{h.subject}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {template?.name ?? h.templateId} · {formatDate(h.sentAt)} · {h.recipientCount} recipient
                                                {h.recipientCount !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                        <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Sent</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {/* ── Preview modal ────────────────────────────────────────────── */}
            {previewOpen && previewHtml && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                            <p className="text-sm font-semibold text-slate-800">Email Preview</p>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewOpen(false)} className="h-7 text-xs">
                                Close
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <iframe srcDoc={previewHtml} title="Email preview" className="w-full border-0 rounded-lg" style={{ minHeight: "600px" }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
