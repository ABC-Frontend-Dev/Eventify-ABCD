import HeaderDescription from "@/components/common/HeaderDescription";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import Link from "next/link";
import SubHeading from "@/components/common/SubHeading";
import CardFlip from "@/components/ui/flip-card";
import BlogsCard from "./BlogsCard";

export default function HomeBlogs() {
    return (
        <section className="max-w-360 w-full mx-auto px-20 py-9">
            <header>
                <HeadingWithoutLogo title="blog" />
                <SubHeading title="Inside the Event World" />
                <HeaderDescription description="Step behind the scenes of extraordinary events." scrollContainerRef={undefined} />
            </header>

            <div className="">
                <div className="flex items-center justify-center w-full mt-9 gap-5.5">
                    <BlogsCard />
                </div>
                <div className="mt-5">
                    <Link href="/blog" className="text-xl font-helvetica-bold text-primary text-center py-5.25 border border-primary rounded-[1px] overflow-hidden w-full block">
                        View All
                    </Link>
                </div>
            </div>
        </section>
    );
}
