// components/layout/Blog/ViewTracker.tsx
"use client";

import { useTrackBlogView } from "@/hooks/useTrackBlogView";

interface ViewTrackerProps {
    slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
    useTrackBlogView(slug);
    return null; // This component doesn't render anything
}
