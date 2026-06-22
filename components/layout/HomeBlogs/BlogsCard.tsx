import prisma from "@/lib/prisma";
import FeaturedBlogsCard from "./FeaturedBlogsCard";
import TopReads from "./TopReads";

export default async function BlogsCard() {
    // This now works because 'prisma' was initialized with an adapter
    const models = await prisma.model.findMany();

    return (
        <>
            <FeaturedBlogsCard />
            <TopReads />
        </>
    );
}
