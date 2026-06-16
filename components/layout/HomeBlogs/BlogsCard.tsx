// Import the shared instance, NOT the class
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function BlogsCard() {
    // This now works because 'prisma' was initialized with an adapter
    const models = await prisma.model.findMany();

    return (
        <>
            <div className="max-w-3xl min-h-168.5 h-168.5 w-full">
                <figure className="w-full h-full">
                    <Image src="/images/blogs/Group 48524.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-full object-cover" />
                </figure>
            </div>
            <div className="max-w-122.5 w-full space-y-1.5 relative">
                <h2 className="text-4xl leading-8 font-helvetica-medium tracking-tight text-footer-bg absolute -top-6">Top reads</h2>
                <div className="w-full h-41 overflow-hidden relative group">
                    <Link href={"#"}>
                        <figure className="w-full h-full">
                            <Image src="/images/blogs/Group 48524.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
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
                    <Link href={"#"}>
                        <figure className="w-full h-full">
                            <Image src="/images/blogs/Group 48524.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
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
                    <Link href={"#"}>
                        <figure className="w-full h-full">
                            <Image src="/images/blogs/Group 48524.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
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
                    <Link href={"#"}>
                        <figure className="w-full h-full">
                            <Image src="/images/blogs/Group 48524.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
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
