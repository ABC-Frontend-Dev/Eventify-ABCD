"use client";

interface BlogTextRevealProps {
    text: string;
}

export default function BlogTextReveal({ text }: BlogTextRevealProps) {
    return <p className="text-sm lg:text-lg leading-5.5 font-helvetica font-medium mt-2.5 text-gray-700">{text}</p>;
}
