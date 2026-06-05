import HeaderDescription from "@/components/common/HeaderDescription";
import Image from "next/image";
import SubHeading from "@/components/common/SubHeading";

interface FramesImagesProps {
    id: number;
    images: string;
}

export default function InspirationInFrames() {
    // const images: FramesImagesProps[]=[
    //     {
    //         id: 1,
    //         images: ""
    //     },
    // ]
    return (
        <section className="max-w-360 w-full mx-auto px-20 py-9">
            <header>
                <SubHeading title="Inspiration in Frames" />
                <HeaderDescription description="A curated glimpse into our visual world" scrollContainerRef={undefined} />
            </header>

            <div className="flex items-center justify-center w-full mt-7.5 gap-2.5">
                <ul className="flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, index) => {
                        return (
                            <li
                                key={index}
                                className="w-full h-87.5 flex items-center justify-center group  relative hover:after:absolute hover:after:top-0 hover:after:left-0 hover:after:w-full hover:after:h-full hover:after:bg-black/60 transition-all duration-300 overflow-hidden cursor-pointer"
                            >
                                <Image
                                    src={`/images/inspiration-in-frames/Card UI - ${index + 1}.png`}
                                    alt={`Client ${index + 1}`}
                                    width={1000}
                                    height={1000}
                                    className="w-full h-87.5 object-contain scale-110 group-hover:scale-100 transition-all"
                                />

                                <div className="w-12.5 h-12.5 bg-white absolute left-2.5 bottom-2.5 opacity-0 pointer-events-none group-hover:opacity-100 flex items-center justify-center z-20 transition-opacity duration-500">
                                    <Image src={"/images/icons/instagram.png"} alt={"Instagram"} width={1000} height={1000} className="w-10 h-10 object-contain" />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
