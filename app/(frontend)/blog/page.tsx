// app/(frontend)/blog/page.tsx
import { Suspense } from "react";
import BlogListHeader from "@/components/layout/Blog/BlogListHeader";
import { EmblaCarousel } from "@/components/layout/Blog/BlogListCarouselCard";
import Image from "next/image";

export default function Blog() {
    return (
        <div className="max-w-360 w-full mx-auto px-20 py-9">
            <Suspense fallback={<BlogListHeaderSkeleton />}>
                <BlogListHeader />
            </Suspense>

            <div className="mt-7.5">
                <div className="flex items-start justify-center gap-5">
                    <div className="max-w-157.5 w-full h-full relative">
                        <figure className="h-142.25 w-full overflow-hidden relative after:absolute after:w-full after:h-full after:inset-0 after:bg-black/20 after:pointer-events-none">
                            <Image src="/images/blogs/Group 48529.png" alt="blog1" width={1000} height={1000} className="h-full w-full object-cover" />
                        </figure>
                        <div className="absolute w-[94%] bottom-3.5 left-1/2 -translate-x-1/2 p-5 bg-black/20 backdrop-blur-lg z-10">
                            <div className="border border-primary/80 bg-primary/80 rounded-[6px] p-2.5 capitalize font-product-sans-medium font-light w-fit text-white">Activations</div>
                            <div className="mt-1.75 text-[20px] leading-6.5 tracking-wide font-product-sans-bold font-extralight text-white">
                                Emirates College for Advanced Education concludes 10th Annual Autism Day event
                            </div>
                            <div className="mt-2 text-sm leading-4 tracking-wide text-white font-helvetica font-light">The Emirates College for Advanced Education (ECAE) has</div>
                            <div className="mt-2.75 flex items-center gap-3">
                                <figure className="h-7.5 w-7.5 rounded-full overflow-hidden">
                                    <Image src="/images/blogs/Ellipse 5.png" alt="blog1" width={1000} height={1000} className="h-full w-full object-cover" />
                                </figure>
                                <ul className="flex items-center gap-1.5">
                                    <li className="">
                                        <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">Maximus Wooten</p>
                                    </li>
                                    <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                    <li className="">
                                        <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">Apr 12, 2026</p>
                                    </li>
                                    <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                    <li className="">
                                        <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">5 min</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 grid-rows-2 gap-5">
                        <div className="max-w-157.5 w-full col-span-2 relative">
                            <figure className="h-68.5 max-w-157.5 w-full overflow-hidden">
                                <Image src="/images/blogs/Group 48529sadf.png" alt="blog1" width={1000} height={1000} className="h-full w-full object-cover" />
                            </figure>
                            <div className="absolute w-[94%] bottom-3.5 left-1/2 -translate-x-1/2 px-5 py-[14.67px] bg-black/20 backdrop-blur-lg z-10">
                                <div className="border border-primary/80 bg-primary/80 rounded-[6px] p-2.5 capitalize font-product-sans-medium font-light w-fit text-white">Corporate Events</div>
                                <div className="mt-1.75 text-[18px] leading-6.5 font-product-sans-bold font-medium text-white">
                                    Emirates College for Advanced Education concludes 10th Annual Autism Day event
                                </div>
                                <div className="mt-2.75 flex items-center gap-3">
                                    <ul className="flex items-center gap-1.5">
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">Maximus Wooten</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">Apr 12, 2026</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">5 min</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="row-start-2 col-start-1 relative">
                            <figure className="h-68.5 w-full overflow-hidden">
                                <Image src="/images/blogs/Group 48524.png" alt="blog1" width={1000} height={1000} className="h-full w-full object-cover" />
                            </figure>
                            <div className="absolute w-[94%] bottom-3.5 left-1/2 -translate-x-1/2 p-3.5 bg-black/20 backdrop-blur-lg z-10">
                                <div className="border border-primary/80 bg-primary/80 rounded-[6px] p-2.5 capitalize font-product-sans-medium font-light w-fit text-white">Activations</div>
                                <div className="mt-1.75 text-[16px] leading-5 font-product-sans-bold font-medium text-white">Emirates College for Advanced Education concludes...</div>
                                <div className="mt-2.75 flex items-center gap-3">
                                    <ul className="flex items-center gap-1.5">
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">Maximus Wooten</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">Apr 12, 2026</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">5 min</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="row-start-2 col-start-2 relative">
                            <figure className="h-68.5 w-full overflow-hidden">
                                <Image src="/images/blogs/Group 48528.png" alt="blog1" width={1000} height={1000} className="h-full w-full object-cover" />
                            </figure>
                            <div className="absolute w-[94%] bottom-3.5 left-1/2 -translate-x-1/2 p-3.5 bg-black/20 backdrop-blur-lg z-10">
                                <div className="border border-primary/80 bg-primary/80 rounded-[6px] p-2.5 capitalize font-product-sans-medium font-light w-fit text-white">experiental</div>
                                <div className="mt-1.75 text-[16px] leading-5 font-product-sans-bold font-medium text-white">Emirates College for Advanced Education concludes...</div>
                                <div className="mt-2.75 flex items-center gap-3">
                                    <ul className="flex items-center gap-1.5">
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">Maximus Wooten</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">Apr 12, 2026</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">5 min</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-11.25">
                <h2 className="font-helvetica font-bold text-[34px] leading-10 mb-4">Global Highlights</h2>
                <EmblaCarousel />
            </div>
        </div>
    );
}

// Loading skeleton for BlogListHeader
function BlogListHeaderSkeleton() {
    return (
        <div className="flex items-start justify-between animate-pulse">
            <div>
                <div className="h-10 bg-gray-200 rounded w-32 mb-3.5"></div>
                <div className="h-5 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="flex items-center gap-7.5">
                <div className="w-147 h-15 bg-gray-200 rounded"></div>
                <div className="w-62 h-15 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}
