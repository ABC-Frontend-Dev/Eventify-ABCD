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
                bio: author.bio || "",
                avatar: author.avatar || "",
            }}
        />
    );
}
