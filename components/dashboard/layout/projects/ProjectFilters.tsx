// components/dashboard/layout/projects/ProjectFilters.tsx
"use client";

export type ProjectSort = "newest" | "oldest" | "az" | "za";

interface ProjectFiltersProps {
    years: number[];
    year: number | null;
    sort: ProjectSort;
    onYearChange: (year: number | null) => void;
    onSortChange: (sort: ProjectSort) => void;
}

const SORT_OPTIONS: { value: ProjectSort; label: string }[] = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "az", label: "A → Z" },
    { value: "za", label: "Z → A" },
];

const base = "rounded-full border px-3 py-1 text-xs font-medium transition-colors";
const active = "border-primary bg-primary text-white";
const idle = "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary";

export function ProjectFilters({ years, year, sort, onYearChange, onSortChange }: ProjectFiltersProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Year */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Year</span>
                <button type="button" onClick={() => onYearChange(null)} className={`${base} ${year === null ? active : idle}`}>
                    All
                </button>
                {years.map((y) => (
                    <button key={y} type="button" onClick={() => onYearChange(y)} className={`${base} ${year === y ? active : idle}`}>
                        {y}
                    </button>
                ))}
            </div>

            {/* Sort */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Sort</span>
                {SORT_OPTIONS.map((o) => (
                    <button key={o.value} type="button" onClick={() => onSortChange(o.value)} className={`${base} ${sort === o.value ? active : idle}`}>
                        {o.label}
                    </button>
                ))}
            </div>
        </div>
    );
}