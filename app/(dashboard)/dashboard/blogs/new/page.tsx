// app/(dashboard)/dashboard/blogs/new/page.tsx
import BlogForm from "@/components/dashboard/layout/blogs/BlogForm";

export default function NewBlogPage() {
    return (
        <div>
            <BlogForm mode="create" />
        </div>
    );
}
