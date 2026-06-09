import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-footer-bg">
            <div className="max-w-360 w-full mx-auto px-5 lg:px-20 py-9">
                <div>
                    <figure className="w-56 h-9">
                        <Image src={"/images/logo-light-with-location.png"} alt="Eventify light logo" width={1000} height={1000} className="w-full h-full object-contain" />
                    </figure>
                </div>
                <div className="mt-8 lg:mt-20.75 text-white">
                    <h2 className="text-xl lg:text-2xl font-helvetica leading-7.5 uppercase pb-5 border-b border-slate-600">OUR OFFICES:</h2>

                    <div className="mt-5 flex items-start gap-5.25">
                        <div>
                            <h2 className="text-xl lg:text-2xl font-helvetica font-bold leading-6 lg:leading-7.5 uppercase mb-2">uae</h2>
                            <h3 className="text-base lg:text-xl font-helvetica font-bold leading-5 lg:leading-6 mb-2.25">Address:</h3>
                            <h3 className="text-xs lg:text-xl font-helvetica font-light leading-4 lg:leading-6 tracking-wide mb-2.25">
                                508, API Business Suite, Al Barsha 1, PO Box 449832, Dubai, UAE
                            </h3>
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-helvetica font-bold leading-6 lg:leading-7.5 uppercase mb-2">ksa</h2>
                            <h3 className="text-base lg:text-xl font-helvetica font-bold leading-5 lg:leading-6 mb-2.25">Address:</h3>
                            <h3 className="text-xs lg:text-xl font-helvetica font-light leading-4 lg:leading-6 tracking-wide mb-2.25">
                                508, Al Noor Business Center, King Fahd Road, Al Olaya District, PO Box 245671, Riyadh, Saudi Arabia
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="mt-8 lg:mt-20.75 text-white">
                    <h2 className="text-xl lg:text-2xl font-helvetica  leading-6 lg:leading-7.5 uppercase">Contact us</h2>

                    <div className="mt-2.5 flex items-start gap-5.25">
                        <div className="hidden text-8xl lg:text-[155px] leading-41.25 font-helvetica-heavy font-extrabold uppercase lg:flex items-start">
                            <span>lets ev</span>
                            <span className="w-31">
                                <Image src={"/images/favicon.png"} alt="Eventify light logo" width={1000} height={1000} className="w-full h-full object-contain" />
                            </span>
                            <span>ntify</span>
                        </div>
                        <div className="text-5xl leading-14 font-helvetica-heavy font-extrabold uppercase flex lg:hidden items-start flex-wrap">
                            <div>lets</div>
                            <div className="flex items-center gap-2">
                                <span>ev </span>
                                <span className="block h-12">
                                    <Image src={"/images/favicon.png"} alt="Eventify light logo" width={1000} height={1000} className="w-full h-full object-contain" />
                                </span>
                                <span>ntify</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
