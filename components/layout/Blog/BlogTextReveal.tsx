"use client";

interface BlogTextRevealProps {
    text: string;
}

export default function BlogTextReveal({ text }: BlogTextRevealProps) {
    return (
        <p className="blog-reveal-block text-lg leading-5.5 font-product-sans-light font-medium mt-2.5">
            {text.split("").map((char, i) => (
                <span
                    key={i}
                    className="reveal-char text-gray-400"
                    style={{
                        whiteSpace: char === " " ? "pre" : "normal",
                    }}
                >
                    {char}
                </span>
            ))}
        </p>
    );
}
