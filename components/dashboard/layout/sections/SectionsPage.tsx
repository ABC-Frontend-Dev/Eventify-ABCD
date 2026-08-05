"use client";

import { useEffect, useState, useRef } from "react";
import { useToasts } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Save, X, ChevronDown, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import DashboardHeader from "../common/Header";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionType = "CLIENT" | "SERVICE" | "TEAM" | "PROJECT" | "AWARD" | "BLOG" | "SYL";

interface Section {
    id: number;
    type: SectionType;
    titlePartOne: string;
    titlePartTwo: string | null;
    description: string | null;
}

// ─── Config — display labels per type ────────────────────────────────────────

const SECTION_CONFIG: Record<SectionType, { label: string; hint: string }> = {
    CLIENT: { label: "Clients", hint: "e.g. Our Clients / Brands that believe in us" },
    SERVICE: { label: "Services", hint: "e.g. What We Do / Services we offer" },
    TEAM: { label: "Team", hint: "e.g. Meet The / Team" },
    PROJECT: { label: "Projects", hint: "e.g. Our / Projects" },
    AWARD: { label: "Awards", hint: "e.g. Recognition & / Awards" },
    BLOG: { label: "Blog", hint: "e.g. Latest / Insights" },
    SYL: { label: "SYL", hint: "e.g. Start Your / Legacy" },
};

const ALL_TYPES: SectionType[] = ["CLIENT", "SERVICE", "TEAM", "PROJECT", "AWARD", "BLOG", "SYL"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inp(extra = "") {
    return `h-9 text-sm border-slate-200 bg-white focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300 ${extra}`;
}

// ─── Single section card ──────────────────────────────────────────────────────

interface SectionCardProps {
    type: SectionType;
    data: Section | null;
    onSaved: (section: Section) => void;
}

function SectionCard({ type, data, onSaved }: SectionCardProps) {
    const toast = useToasts();
    const config = SECTION_CONFIG[type];

    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const bodyRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState({
        titlePartOne: data?.titlePartOne ?? "",
        titlePartTwo: data?.titlePartTwo ?? "",
        description: data?.description ?? "",
    });

    // Sync form when data loads after initial render
    useEffect(() => {
        if (data) {
            setForm({
                titlePartOne: data.titlePartOne,
                titlePartTwo: data.titlePartTwo ?? "",
                description: data.description ?? "",
            });
        }
    }, [data]);

    // Animate accordion open/close
    useEffect(() => {
        const el = bodyRef.current;
        if (!el) return;

        if (open) {
            el.style.maxHeight = "493px";
            el.style.opacity = "1";
        } else {
            el.style.maxHeight = "0px";
            el.style.opacity = "0";
        }
    }, [open]);

    const hasData = !!data?.titlePartOne;

    const handleSave = async () => {
        if (!form.titlePartOne.trim()) {
            toast.warning("Title (Part 1) is required");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/sections/${type.toLowerCase()}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    titlePartOne: form.titlePartOne.trim(),
                    titlePartTwo: form.titlePartTwo.trim() || null,
                    description: form.description.trim() || null,
                }),
            });
            const result = await res.json();

            if (result.success) {
                toast.success(`${config.label} section saved!`);
                onSaved(result.data);
                setOpen(false);
            } else {
                toast.error(result.error || "Failed to save");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset to last saved values
        setForm({
            titlePartOne: data?.titlePartOne ?? "",
            titlePartTwo: data?.titlePartTwo ?? "",
            description: data?.description ?? "",
        });
        setOpen(false);
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-sm">
            {/* ── Card header ───────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4">
                {/* Left — label + status dot */}
                <div className="flex items-center gap-2.5">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${hasData ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className="text-sm font-semibold text-slate-700">{config.label}</span>
                    {!hasData && <span className="text-[11px] text-slate-400 hidden sm:inline">— no data yet</span>}
                </div>

                {/* Right — Add / Update button */}
                <button
                    type="button"
                    onClick={() => setOpen((p) => !p)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200
                        ${
                            open
                                ? "bg-slate-100 border-slate-200 text-slate-600"
                                : hasData
                                  ? "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                                  : "bg-slate-900 border-slate-900 text-white hover:bg-slate-700"
                        }`}
                >
                    {open ? <X className="h-3.5 w-3.5" /> : hasData ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    {open ? "Cancel" : hasData ? "Update" : "Add"}
                    {!open && <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />}
                </button>
            </div>

            {/* ── Saved data preview ────────────────────────────────────────── */}
            {hasData && !open && (
                <div className="px-5 pb-4 border-t border-slate-100 pt-3 space-y-1">
                    {/* Title preview — mimics SubHeading font style */}
                    <p className="text-base font-bold text-primary uppercase leading-tight">
                        {data!.titlePartOne}
                        {data!.titlePartTwo && (
                            <>
                                {" "}
                                <span className="italic font-bold">{data!.titlePartTwo}</span>
                            </>
                        )}
                    </p>
                    {data!.description && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{data!.description}</p>}
                </div>
            )}

            {/* ── Empty state ───────────────────────────────────────────────── */}
            {!hasData && !open && (
                <div className="px-5 pb-4 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                        Add {config.label} section heading and description
                    </div>
                </div>
            )}

            {/* ── Accordion body — input form ───────────────────────────────── */}
            <div
                ref={bodyRef}
                style={{
                    maxHeight: "0px",
                    opacity: "0",
                    overflow: "hidden",
                    transition: "max-height 0.35s ease, opacity 0.25s ease",
                }}
            >
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
                    <p className="text-[11px] text-slate-400 mt-3">{config.hint}</p>

                    {/* Title Part 1 */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                            Title — Part 1<span className="text-red-400">*</span>
                            {form.titlePartOne.trim() && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />}
                        </label>
                        <Input
                            value={form.titlePartOne}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    titlePartOne: e.target.value,
                                }))
                            }
                            placeholder="e.g. Brands that"
                            className={inp()}
                            maxLength={80}
                        />
                        <p className="mt-1 text-[11px] text-slate-400 text-right">{form.titlePartOne.length}/80</p>
                    </div>

                    {/* Title Part 2 */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                            Title — Part 2<span className="ml-1 text-slate-300 font-normal text-[11px]">(optional · shown in italic)</span>
                            {form.titlePartTwo.trim() && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />}
                        </label>
                        <Input
                            value={form.titlePartTwo}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    titlePartTwo: e.target.value,
                                }))
                            }
                            placeholder="e.g. believe in us"
                            className={inp()}
                            maxLength={80}
                        />
                        <p className="mt-1 text-[11px] text-slate-400 text-right">{form.titlePartTwo.length}/80</p>
                    </div>

                    {/* Live title preview */}
                    {(form.titlePartOne || form.titlePartTwo) && (
                        <div className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                            <p className="text-[11px] text-slate-400 mb-1">Heading preview</p>
                            <p className="text-lg font-bold uppercase text-primary leading-tight">
                                {form.titlePartOne}
                                {form.titlePartTwo && (
                                    <>
                                        {" "}
                                        <span className="italic">{form.titlePartTwo}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                            Description
                            <span className="ml-1 text-slate-300 font-normal text-[11px]">(optional)</span>
                            {form.description.trim() && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />}
                        </label>
                        <Textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    description: e.target.value,
                                }))
                            }
                            placeholder="e.g. From startups to established companies, our clients trust us to bring their ideas to life."
                            rows={3}
                            className="text-sm border-slate-200 resize-none focus:border-slate-400 focus:ring-0 rounded-md placeholder:text-slate-300"
                            maxLength={300}
                        />
                        <p className="mt-1 text-[11px] text-slate-400 text-right">{form.description.length}/300</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                        <Button type="button" size="sm" onClick={handleSave} disabled={saving || !form.titlePartOne.trim()} className="h-8 text-xs bg-slate-900 hover:bg-slate-700 text-white gap-1.5">
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            {saving ? "Saving…" : hasData ? "Update" : "Save"}
                        </Button>

                        <Button type="button" size="sm" variant="outline" onClick={handleCancel} disabled={saving} className="h-8 text-xs gap-1.5">
                            <X className="h-3.5 w-3.5" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SectionsPage() {
    const toast = useToasts();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Map of type → Section data (null if not yet created)
    const [sectionsMap, setSectionsMap] = useState<Record<SectionType, Section | null>>(() => {
        const map = {} as Record<SectionType, Section | null>;
        ALL_TYPES.forEach((t) => (map[t] = null));
        return map;
    });

    // ── Fetch all sections ────────────────────────────────────────────────────

    const fetchSections = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const res = await fetch("/api/sections");
            const data = await res.json();

            if (data.success) {
                const map = {} as Record<SectionType, Section | null>;
                ALL_TYPES.forEach((t) => (map[t] = null));

                data.data.forEach((s: Section) => {
                    map[s.type] = s;
                });

                setSectionsMap(map);
            } else {
                toast.error("Failed to load sections");
            }
        } catch {
            toast.error("Failed to load sections");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Called by each card when it saves successfully
    const handleSaved = (type: SectionType) => (section: Section) => {
        setSectionsMap((prev) => ({ ...prev, [type]: section }));
    };

    // ── Stats ─────────────────────────────────────────────────────────────────

    const filledCount = ALL_TYPES.filter((t) => !!sectionsMap[t]).length;

    // ── Loading ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <DashboardHeader title="Section Headings" description={`Manage titles and descriptions for all site sections. ${filledCount}/${ALL_TYPES.length} sections configured.`} />
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchSections(true)} disabled={refreshing} className="h-8 text-xs gap-1.5 shrink-0 mt-1">
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Progress bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">Overall completion</span>
                    <span className="text-[11px] text-slate-400">
                        {filledCount}/{ALL_TYPES.length}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                        style={{
                            width: `${Math.round((filledCount / ALL_TYPES.length) * 100)}%`,
                        }}
                    />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {ALL_TYPES.map((type) => (
                        <div
                            key={type}
                            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                                sectionsMap[type] ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}
                        >
                            {sectionsMap[type] ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {SECTION_CONFIG[type].label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Section cards */}
            <div className="space-y-3">
                {ALL_TYPES.map((type) => (
                    <SectionCard key={type} type={type} data={sectionsMap[type]} onSaved={handleSaved(type)} />
                ))}
            </div>
        </div>
    );
}
