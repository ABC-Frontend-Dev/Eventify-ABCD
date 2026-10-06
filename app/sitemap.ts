// app/sitemap.ts
import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getAbsoluteUrl } from "@/lib/constants";

// Generate the sitemap on every request instead of freezing it at build time.
// That way newly published blogs/services appear straight away, and the URL is
// resolved from the live environment rather than whatever the build machine had.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages. Everything else on the site (about, clients, teams,
    // projects, awards) is a section of the home page, so it has no URL of its own.
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
    ];

    try {
        const [services, blogs] = await Promise.all([
            // Every service in the database (replaces the hardcoded /services/conferences)
            prisma.service.findMany({
                select: { url: true, updatedAt: true },
                orderBy: { order: "asc" },
            }),
            // Published blogs only
            prisma.blog.findMany({
                where: { status: "PUBLISHED" },
                select: { slug: true, updatedAt: true, publishedAt: true },
                orderBy: { publishedAt: "desc" },
            }),
        ]);

        const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
            url: getAbsoluteUrl(`/services/${service.url}`),
            lastModified: service.updatedAt,
            changeFrequency: "monthly",
            priority: 0.8,
        }));

        const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
            url: getAbsoluteUrl(`/blogs/${blog.slug}`),
            lastModified: blog.updatedAt || blog.publishedAt || new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        }));

        return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
    } catch (error) {
        // If the database is unreachable, still serve a valid sitemap with the
        // core pages instead of failing the crawl with a 500.
        console.error("sitemap: failed to load services/blogs:", error);
        return staticRoutes;
    }
}