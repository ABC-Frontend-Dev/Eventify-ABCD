import AuthorForm from "@/components/dashboard/layout/authors/AuthorForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const authorId = parseInt(id);

    if (isNaN(authorId)) notFound();

    const author = await prisma.author.findUnique({
        where: { id: authorId },
    });

    if (!author) notFound();

    return (
        <AuthorForm
            mode="edit"
            authorId={author.id}
            initialData={{
                name: author.name,
                email: author.email,
                // Property 'email' does not exist on type '{ id: number; name: string; profileImage: string | null; }'.
                bio: author.bio || "",
                // Property 'bio' does not exist on type '{ id: number; name: string; profileImage: string | null; }'.
                avatar: author.avatar || "",
                // Property 'avatar' does not exist on type '{ id: number; name: string; profileImage: string | null; }'.
            }}
        />
    );
}
