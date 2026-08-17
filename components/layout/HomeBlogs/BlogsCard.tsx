import FeaturedBlogsCard from "./FeaturedBlogsCard";
import TopReads from "./TopReads";

export default function BlogsCard() {
    return (
        <div className="flex flex-col md:flex-row lg:flex-row w-full gap-y-14 md:gap-x-1.5 lg:gap-5.5">
            <FeaturedBlogsCard />
            <TopReads />
        </div>
    );
}
