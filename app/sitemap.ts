// app/sitemap.ts
import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getAbsoluteUrl } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all published blogs
    const blogs = await prisma.blog.findMany({
        where: {
            status: "PUBLISHED",
        },
        select: {
            slug: true,
            updatedAt: true,
            publishedAt: true,
        },
        orderBy: {
            publishedAt: "desc",
        },
    });

    // Static routes with their priorities and update frequencies
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: getAbsoluteUrl("/"),
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: getAbsoluteUrl("/blogs"),
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: getAbsoluteUrl("/services/conferences"),
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        // Add more static routes as needed
        // {
        //   url: getAbsoluteUrl('/about'),
        //   lastModified: new Date(),
        //   changeFrequency: 'monthly',
        //   priority: 0.7,
        // },
    ];

    // Dynamic blog routes
    const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
        url: getAbsoluteUrl(`/blogs/${blog.slug}`),
        lastModified: blog.updatedAt || blog.publishedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    // Combine all routes
    return [...staticRoutes, ...blogRoutes];
}

// Optional: Configure revalidation
export const revalidate = 86400; // Revalidate every day (in seconds)
