"use client";

interface BlogTextRevealProps {
    text: string;
}

export default function BlogTextReveal({ text }: BlogTextRevealProps) {
    return <p>{text}</p>;
}
