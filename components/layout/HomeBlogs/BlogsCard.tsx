// Import the shared instance, NOT the class
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function BlogsCard() {
    // This now works because 'prisma' was initialized with an adapter
    const models = await prisma.model.findMany();

    return (
        <>
            <div className="max-w-3xl max-h-full lg:min-h-168.5 h-full lg:h-168.5 w-full relative group mb-20 lg:mb-0">
                <Link href="blog/the-right-event-management-compnay-in-dubai" className="block">
                    <figure className="w-full h-full">
                        <Image src="/images/blogs/Blog image.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-full object-cover object-center" />
                    </figure>

                    <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-md flex items-center justify-center px-5 lg:px-7.5 py-5 lg:py-7.5 opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 group-hover:pointer-events-auto">
                        <p className="text-center text-base lg:text-xl leading-5.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">Event drive Prepares the Event Managers of Tomorrow</p>

                        <p className="absolute px-7.5 w-full bottom-5 left-1/2 -translate-x-1/2 text-center text-xs lg:text-sm leading-4 lg:leading-5 tracking-wider font-helvetica text-white">
                            The dark cloud is gradually dissipating and we can see the future of our events taking shape. After more than a year{" "}
                            <span className="hidden lg:block">of organizing virtual events you were able to develop ne</span> ... <span className="underline">Read more</span>
                        </p>
                    </div>
                </Link>
            </div>
            <div className="max-w-122.5 w-full space-y-1.5 relative">
                <h2 className="text-4xl leading-8 font-helvetica-medium tracking-tight text-footer-bg absolute -top-16">Top reads</h2>
                <div className="w-full h-41 overflow-hidden relative group">
                    <Link href="/blog/plan-a-successful-product-launch-event">
                        <figure className="w-full h-full">
                            <Image src="/images/blogs/Blog 1.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
                        </figure>

                        <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-md px-5 lg:px-12.75 py-5 lg:py-7.5 opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 group-hover:pointer-events-auto">
                            <p className="text-center text-base lg:text-xl leading-5.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">
                                Event drive Prepares the Event Managers of Tomorrow
                            </p>

                            <p className="mt-5 text-center text-xs lg:text-sm leading-4 lg:leading-4.5 tracking-wider font-helvetica text-white">
                                The dark cloud is gradually dissipating and we can see the future of our events taking shape. After mor...
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="w-full h-41 overflow-hidden relative group">
                    <Link href="/blog/plan-a-successful-product-launch-event">
                        <figure className="w-full h-full">
                            <Image src="/images/blogs/Rectangle 283.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
                        </figure>

                        <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-md px-5 lg:px-12.75 py-5 lg:py-7.5 opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 group-hover:pointer-events-auto">
                            <p className="text-center text-base lg:text-xl leading-5.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">
                                Event drive Prepares the Event Managers of Tomorrow
                            </p>

                            <p className="mt-5 text-center text-xs lg:text-sm leading-4 lg:leading-4.5 tracking-wider font-helvetica text-white">
                                The dark cloud is gradually dissipating and we can see the future of our events taking shape. After mor...
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="w-full h-41 overflow-hidden relative group">
                    <Link href="/blog/plan-a-successful-product-launch-event">
                        <figure className="w-full h-full">
                            <Image src="/images/blogs/Blog 3.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
                        </figure>

                        <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-md px-5 lg:px-12.75 py-5 lg:py-7.5 opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 group-hover:pointer-events-auto">
                            <p className="text-center text-base lg:text-xl leading-5.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">
                                Event drive Prepares the Event Managers of Tomorrow
                            </p>

                            <p className="mt-5 text-center text-xs lg:text-sm leading-4 lg:leading-4.5 tracking-wider font-helvetica text-white">
                                The dark cloud is gradually dissipating and we can see the future of our events taking shape. After mor...
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="w-full h-41 overflow-hidden relative group">
                    <Link href="/blog/plan-a-successful-product-launch-event">
                        <figure className="w-full h-full">
                            <Image src="/images/blogs/Blog 4.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
                        </figure>

                        <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-md px-5 lg:px-12.75 py-5 lg:py-7.5 opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 group-hover:pointer-events-auto">
                            <p className="text-center text-base lg:text-xl leading-5.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">
                                Event drive Prepares the Event Managers of Tomorrow
                            </p>

                            <p className="mt-5 text-center text-xs lg:text-sm leading-4 lg:leading-4.5 tracking-wider font-helvetica text-white">
                                The dark cloud is gradually dissipating and we can see the future of our events taking shape. After mor...
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}
