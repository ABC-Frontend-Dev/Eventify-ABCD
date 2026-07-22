import Image from "next/image";
import Breadcrumb from "@/components/common/Breadcrumb";

interface Service {
    id: number;
    title: string;
    url: string;
    description: string;
    content: string;
    image: string;
    bannerImage?: string;
    images?: Array<{ id: number; image: string; title?: string }>;
}

async function getService(url: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/services/by-url/${url}`, { next: { revalidate: 60, tags: ["services"] } });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Error fetching service:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ url: string }> }) {
    const { url } = await params;
    const data = await getService(url);
    const service = data?.data;

    return {
        title: service?.title || "Service",
        description: service?.description || "Eventify Service",
    };
}

export default async function ServicePage({ params }: { params: Promise<{ url: string }> }) {
    const { url } = await params;
    const data = await getService(url);
    const service: Service = data?.data;

    // if (!service) {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen">
    //             <p className="text-slate-500">Service not found</p>
    //         </div>
    //     );
    // }

    // Calculate grid layout
    const getGridLayout = (count: number) => {
        if (count === 0) return "grid-cols-1 grid-rows-1";
        if (count === 1) return "grid-cols-1 grid-rows-1";
        if (count === 2) return "grid-cols-1 grid-rows-2";
        if (count === 3) return "grid-cols-1 grid-rows-3";
        if (count === 4) return "grid-cols-2 grid-rows-2";
        if (count === 5) return "grid-cols-2 grid-rows-3";
        if (count === 6) return "grid-cols-2 grid-rows-3";
        if (count === 7) return "grid-cols-2 grid-rows-4";
        if (count === 8) return "grid-cols-2 grid-rows-4";
        return "grid-cols-2 grid-rows-4";
    };

    const imageCount = service.images?.length || 0;

    return (
        <div className="relative bg-[linear-gradient(90deg,_rgba(255,255,255,1)_45%,_rgba(16,132,179,0)_100%)] py-15">
            <div className="max-w-360 w-full mx-auto px-5 lg:px-20 pb-0">
                <div>
                    <div className="text-[40px] leading-10 font-helvetica font-bold tracking-wide">Our services</div>
                    <Breadcrumb props={{ className: "mt-3.5" }} />
                </div>

                <article className="mt-7.5">
                    <header>
                        <h1 className="text-4xl font-helvetica-medium leading-8 text-primary uppercase">{service.title}</h1>
                    </header>

                    <div className="mt-3.5 flex flex-row gap-0">
                        <div className="w-[70%] pr-10">
                            {/* Rich text content */}
                            <div
                                className="prose prose-sm max-w-none font-helvetica text-base text-footer-bg leading-5.5 tracking-wide services-content"
                                dangerouslySetInnerHTML={{
                                    __html: service.content,
                                }}
                            />
                        </div>

                        {/* Gallery */}
                        {imageCount > 0 && (
                            <div className="w-[40%]">
                                <ul className={`grid ${getGridLayout(imageCount)} mt-3.5 gap-2.5`}>
                                    {service.images?.map((item, idx) => (
                                        <li key={idx} className="w-full h-33 px-4 py-2.5 bg-white">
                                            <figure>
                                                <Image src={item.image} alt={item.title || `Image ${idx + 1}`} width={1000} height={1000} className="w-full h-fit object-contain" />
                                            </figure>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </article>
            </div>

            {/* Banner image background */}
            {service.bannerImage && (
                <figure className="absolute right-0 top-0 w-[55%] h-full -z-1">
                    <Image src={service.bannerImage} alt="Service banner" width={1000} height={1000} className="w-full h-full object-cover" />
                </figure>
            )}
        </div>
    );
}
