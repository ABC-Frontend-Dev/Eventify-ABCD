import HeaderDescription from "@/components/common/HeaderDescription";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import Image from "next/image";
import SubHeading from "@/components/common/SubHeading";
import CardFlip from "@/components/ui/flip-card";

export default function AboutUs() {
    return (
        <section className="max-w-360 w-full mx-auto px-5 lg:px-20 pt-9 lg:py-9">
            <header>
                <HeadingWithoutLogo title="About Us" />
                <SubHeading title="The team behind every celebration" />
                <HeaderDescription
                    description="Eventify is a Dubai-born events company redefining how people experience culture, entertainment, and live moments. Built by industry leaders and creatives who have helped shape the region’s event scene for over two decades, Eventify thrives at the intersection of ideas, energy, and execution."
                    scrollContainerRef={undefined}
                />
            </header>

            <div className="flex items-center justify-center flex-col-reverse lg:flex-row w-full mt-5 lg:mt-9 gap-2.5">
                <div className="w-full">
                    <div className="space-y-2.5">
                        <CardFlip
                            className="w-full lg:w-[288px] h-51.25 "
                            title="Being award-winning is part of the story, but not the goal."
                            description="Whether It's A High-Energy Festival, A Cultural Moment, A Corporate Experience, Or A Brand Activation, Eventify Thrives On Variety, Constantly Evolving And Shaping Each Event Around
Its Audience And Purpose."
                        />
                        <CardFlip
                            className="w-full lg:w-[288px] h-51.25 "
                            title="Being award-winning is part of the story, but not the goal."
                            description="Whether It's A High-Energy Festival, A Cultural Moment, A Corporate Experience, Or A Brand Activation, Eventify Thrives On Variety, Constantly Evolving And Shaping Each Event Around
Its Audience And Purpose."
                        />
                        <CardFlip
                            className="w-full lg:w-[288px] h-51.25 "
                            title="Being award-winning is part of the story, but not the goal."
                            description="Whether It's A High-Energy Festival, A Cultural Moment, A Corporate Experience, Or A Brand Activation, Eventify Thrives On Variety, Constantly Evolving And Shaping Each Event Around
Its Audience And Purpose."
                        />
                    </div>
                </div>
                <div className="w-full lg:w-245.5 shrink-0">
                    <figure className="w-full h-full">
                        <Image src={"/images/about-bg.png"} alt="about us" loading="eager" width={1000} height={1000} className="w-full h-full lg:h-158.75 object-cover" />
                    </figure>
                </div>
            </div>
        </section>
    );
}
