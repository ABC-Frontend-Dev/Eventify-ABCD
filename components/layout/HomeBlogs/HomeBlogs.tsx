import HeaderDescription from "@/components/common/HeaderDescription";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import Link from "next/link";
import SubHeading from "@/components/common/SubHeading";
import CardFlip from "@/components/ui/flip-card";
import BlogsCard from "./BlogsCard";

export default function HomeBlogs() {
    return (
        <section id="blogs" className="max-w-360 w-full mx-auto px-5 lg:px-20 py-9 scroll-mt-14">
            <header>
                <HeadingWithoutLogo title="blog" />
                <SubHeading sectionType="BLOG" showDescription />
            </header>

            <div className="">
                <div className="flex items-center justify-center flex-col md:flex-row lg:flex-row w-full mt-4 lg:mt-5 gap-y-1.5 lg:gap-5.5">
                    <BlogsCard />
                </div>
                {/* <div className="mt-5">
                    <Link href="/blog" className="text-xl font-helvetica-bold text-primary text-center py-5.25 border border-[#7D09CA] rounded-[1px] overflow-hidden w-full block">
                        View All
                    </Link>
                </div> */}
            </div>
        </section>
    );
}
