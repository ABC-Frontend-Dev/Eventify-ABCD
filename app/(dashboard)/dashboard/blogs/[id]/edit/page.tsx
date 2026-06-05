// app/(dashboard)/dashboard/blogs/[id]/edit/page.tsx
import BlogForm from "@/components/dashboard/layout/blogs/BlogForm";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div>
            <BlogForm mode="edit" blogId={parseInt(id)} />
        </div>
    );
}
