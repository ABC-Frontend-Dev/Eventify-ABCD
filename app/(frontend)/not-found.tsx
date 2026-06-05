import { Metadata } from "next";

export const metadata: Metadata = {
    title: "404 - Not Found",
    description: "The page you are looking for does not exist.",
};

export default function CustomNotFoundPage() {
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
        </div>
    );
}
