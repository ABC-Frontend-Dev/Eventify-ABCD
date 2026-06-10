// components/layout/OurTeam/OurTeam.tsx

import HeadingWithLogo from "@/components/common/HeadingWithLogo";
import HeaderDescription from "@/components/common/HeaderDescription";
import SubHeading from "@/components/common/SubHeading";
import Teams from "./Teams";
import OurTeamMobileView from "./OurTeamMobileView";

export default function OurTeam() {
    return (
        <section className="max-w-360 w-full mx-auto px-5 lg:px-20 pt-9 lg:py-9">
            <header>
                <HeadingWithLogo titlePart1="" titlePart2_1="T" titlePart2_2="am" />
                <SubHeading title="our event experts" />
                <HeaderDescription description="The talented individuals working together to create memorable events." scrollContainerRef={undefined} />
            </header>
            <div className="mt-9">
                <Teams />
                <OurTeamMobileView />
            </div>
        </section>
    );
}
