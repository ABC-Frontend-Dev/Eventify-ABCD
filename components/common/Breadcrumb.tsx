"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb({ props }: { props?: any }) {
    const pathname = usePathname();

    const pathSegments = pathname.split("/").filter(Boolean);

    // Check if current page is a blog detail page: /blogs/some-slug
    const isBlogDetailPage = pathSegments[0] === "blogs" && pathSegments.length > 1;

    const textColor = isBlogDetailPage ? "text-white" : "text-footer-bg";
    const separatorColor = isBlogDetailPage ? "text-white" : "text-footer-bg";

    return (
        <ul className={`flex items-start lg:items-center flex-wrap gap-2 font-helvetica font-semibold tracking-wide ${props?.className || ""}`}>
            <li>
                <Link href="/" className={`text-xs lg:text-lg leading-4.5 lg:leading-4 ${textColor} hover:text-primary transition-colors duration-200`}>
                    Home
                </Link>
            </li>

            {pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1;

                let href = "/" + pathSegments.slice(0, index + 1).join("/");

                // Special case:
                // /services/abc -> Services breadcrumb goes to /#services
                if (segment === "services" && pathSegments.length > 1) {
                    href = "/#services";
                }

                return (
                    <div key={href} className="flex items-center gap-2">
                        <li className={`text-xs lg:text-lg leading-4.5 lg:leading-4 ${separatorColor}`}>/</li>

                        <li>
                            {isLast ? (
                                <span className="text-xs lg:text-lg leading-4.5 lg:leading-4 text-primary capitalize">{segment.replace(/-/g, " ")}</span>
                            ) : (
                                <Link href={href} className={`text-xs lg:text-lg leading-4.5 lg:leading-4 ${textColor} hover:text-primary transition-colors duration-200 capitalize`}>
                                    {segment.replace(/-/g, " ")}
                                </Link>
                            )}
                        </li>
                    </div>
                );
            })}
        </ul>
    );
}
