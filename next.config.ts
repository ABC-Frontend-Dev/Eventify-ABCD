import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "1000mb",
        },
    },

    async redirects() {
        return [
            {
                source: "/blogs",
                destination: "/#blogs",
                permanent: false,
            },
            {
                source: "/services",
                destination: "/#services",
                permanent: false,
            },
        ];
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
        ],
    },
};

export default nextConfig;