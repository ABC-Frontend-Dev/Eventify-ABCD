// Import the shared instance, NOT the class
import prisma from "@/lib/prisma";
import Image from "next/image";

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
            <div className="max-w-122.5 w-full space-y-1.5">
                <div className="w-full h-41 overflow-hidden">
                    <figure className="w-full h-full">
                        <Image src="/images/blogs/Group 48524.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
                    </figure>
                </div>
                <div className="w-full h-41 overflow-hidden">
                    <figure className="w-full h-full">
                        <Image src="/images/blogs/Group 48524.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
                    </figure>
                </div>
                <div className="w-full h-41 overflow-hidden">
                    <figure className="w-full h-full">
                        <Image src="/images/blogs/Group 48524.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
                    </figure>
                </div>
                <div className="w-full h-41 overflow-hidden">
                    <figure className="w-full h-full">
                        <Image src="/images/blogs/Group 48524.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-41 object-cover object-center" />
                    </figure>
                </div>
            </div>
        </>
    );
}
