// app/robots.ts
import { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard/*", "/api/*", "/dashboard", "/api"],
            },
        ],
        sitemap: getAbsoluteUrl("/sitemap.xml"),
    };
}
