"use client";

import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({
    items,
    className = "",
}: BreadcrumbProps) {
    return (
        <ul
            className={`mt-1.5 md:mt-3.5 text-white flex items-center flex-nowrap overflow-hidden w-full max-w-full gap-2 font-helvetica font-semibold tracking-wide ${className}`}
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <li
                        key={`${item.label}-${index}`}
                        className={`flex items-center gap-2 ${
                            isLast ? "min-w-0 shrink" : "shrink-0"
                        }`}
                    >
                        {/* Separator */}
                        {index > 0 && (
                            <span className="text-[10px] lg:text-xs leading-3.5 lg:leading-4 text-footer-bg shrink-0">
                                /
                            </span>
                        )}

                        {/* Last item */}
                        {isLast || !item.href ? (
                            <span className="text-[10px] lg:text-xs leading-3.5 lg:leading-4 text-primary capitalize truncate block">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className="text-[10px] lg:text-xs leading-3.5 lg:leading-4 text-footer-bg hover:text-primary transition-colors duration-200 capitalize truncate block shrink-0"
                            >
                                {item.label}
                            </Link>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}