import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import SubHeading from "@/components/common/SubHeading";
import BlogsCard from "./BlogsCard";

export default function HomeBlogs() {
    return (
        <section id="blogs" className="max-w-360 w-full mx-auto px-5 lg:px-20 py-9 scroll-mt-6 md: scroll-mt-6 md:scroll-mt-1">
            <header>
                <HeadingWithoutLogo title="blog" />
                <SubHeading sectionType="BLOG" showDescription />
            </header>

            <div className="mt-3 lg:mt-7.5">
                <BlogsCard />
            </div>
        </section>
    );
}
