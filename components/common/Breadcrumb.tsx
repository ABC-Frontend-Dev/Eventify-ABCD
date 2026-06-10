"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb({ props }: { props?: any }) {
    const pathname = usePathname();

    // Split path into segments
    const pathSegments = pathname.split("/").filter(Boolean);

    return (
        <ul className={`flex items-start lg:items-center flex-wrap gap-2 font-helvetica font-semibold tracking-wide ${props?.className || ""}`}>
            <li>
                <Link href="/" className="text-xs lg:text-lg leading-4.5 lg:leading-4 text-footer-bg">
                    Home
                </Link>
            </li>

            {pathSegments.map((segment, index) => {
                const href = "/" + pathSegments.slice(0, index + 1).join("/");

                const isLast = index === pathSegments.length - 1;

                return (
                    <div key={href} className="flex items-center gap-2">
                        <li className="text-xs lg:text-lg leading-4.5 lg:leading-4 text-footer-bg">/</li>

                        <li>
                            {isLast ? (
                                <span className="text-xs lg:text-lg leading-4.5 lg:leading-4 text-primary capitalize">{segment.replace(/-/g, " ")}</span>
                            ) : (
                                <Link href={href} className="text-lg leading-4 text-footer-bg capitalize">
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
