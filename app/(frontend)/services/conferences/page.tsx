// app/(frontend)/blog/[slug]/page.tsx
import Breadcrumb from "@/components/common/Breadcrumb";
import ServicesContent from "@/components/layout/Services/ServicesContent";

export default async function SeviceMainPage() {
    return (
        <section className="max-w-360 w-full mx-auto px-5 lg:px-20 pb-9 mt-20 lg:mt-25">
            <div>
                <div className="text-[40px] leading-10 font-helvetica font-bold tracking-wide">Blog</div>
                <Breadcrumb props={{ className: "mt-3.5" }} />
            </div>

            <div className="mt-7.5">
                <ServicesContent />
            </div>
        </section>
    );
}
