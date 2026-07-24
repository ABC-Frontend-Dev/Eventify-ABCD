// hooks/useTrackBlogView.ts
"use client";

import { useEffect } from "react";

export function useTrackBlogView(slug: string) {
    useEffect(() => {
        const timer = setTimeout(() => {
            fetch(`/api/blogs/view?slug=${slug}`, {
                method: "POST",
            }).catch((error) => console.error("Failed to track view:", error));
        }, 3000);

        return () => clearTimeout(timer);
    }, [slug]);
}
