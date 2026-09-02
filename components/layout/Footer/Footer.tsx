import { GoesOutComesInUnderline } from "@/components/ui/underline-animation";
import Image from "next/image";
import Link from "next/link";
import SocialIcon from "@/components/ui/SocialIcon";
import NewsLetter from "../NewsLetter/NewsLetter";

export default function Footer() {
    return (
        <footer className="bg-footer-bg">
            <div className="max-w-360 w-full mx-auto px-5 lg:px-20 py-4.5 lg:py-9">
                <div className="flex items-start lg:items-center justify-between md:justify-between flex-col md:flex-row gap-y-2.5">
                    <figure className="shrink-0 w-56 lg:w-58 h-9 lg:h-12">
                        <Image
                            src="https://res.cloudinary.com/afdhm38k/image/upload/v1787295544/eventify-light-logo-with-uae-ksa_m8nbd3.png"
                            alt="Eventify light logo"
                            width={1000}
                            height={1000}
                            className="w-full h-full object-contain"
                        />
                    </figure>
                    {/* <NewsLetter /> */}
                    <div className="hidden sm:block">
                        <ul className="flex gap-2.5">
                            <li>
                                <Link href={"https://www.facebook.com/Eventifyentertainment/"}>
                                    <FacebookIcon />
                                </Link>
                            </li>
                            <li>
                                <Link href={"https://www.instagram.com/eventifyentertainment/"}>
                                    <InstagramIcon />
                                </Link>
                            </li>
                            <li>
                                <Link href={"https://ae.linkedin.com/company/eventifyentertainment"}>
                                    <LinkedInIcon />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 sm:mt-9 md:mt-9.5 lg:mt-10 xl:mt-11 1-xl:mt-13 text-white">
                    <p className="text-xl lg:text-2xl xl:text-3xl font-abc-laica-a-italic-variable-trial leading-6 lg:leading-7.5 xl:leading-8.5 capitalize">Our Offices</p>

                    <div className="mt-3 sm:mt-4 md:6 lg:mt-7 xl:mt-8 1-xl:mt-11 flex items-start flex-col sm:flex-row justify-between w-full">
                        <div className="flex items-start flex-col lg:flex-row gap-5.25 w-full shrink xl:shrink-0">
                            <div className="flex flex-col sm:flex-row w-full lg:w-3/5 1-xl:w-1/2 gap-0 md:gap-5.25 shrink-0">
                                <div className="w-full sm:w-1/4 md:w-1/2 shrink-0 md:shrink xl:shrink-0">
                                    <p className="text-lg lg:text-2xl font-abc-laica-a-italic-variable-trial font-medium leading-6 lg:leading-7.5 uppercase mb-1 lg:mb-1">uae</p>
                                    {/* <p className="text-sm lg:text-xl leading-4.5 font-helvetica-neue-roman lg:font-helvetica-medium tracking-[1px] font-bold lg:leading-6 mb-1.5 lg:mb-2.25">Address:</p> */}
                                    <p className="text-xs lg:text-xl font-helvetica-thin font-light leading-4 lg:leading-6 tracking-wider lg:tracking-wide mb-2.25">
                                        508, API Business Suite, Al Barsha 1, PO Box 449832, Dubai, UAE
                                    </p>
                                </div>
                                <div className="w-full sm:w-1/4 md:w-1/2 shrink-0 md:shrink xl:shrink-0">
                                    <p className="text-lg lg:text-2xl font-abc-laica-a-italic-variable-trial font-medium leading-6 lg:leading-7.5 uppercase mb-1 lg:mb-1">ksa</p>
                                    {/* <p className="text-sm lg:text-xl font-helvetica-neue-roman lg:font-helvetica-medium tracking-[1px] font-bold leading-4.5 lg:leading-6  mb-1.5 lg:mb-2.25">Address:</p> */}
                                    <p className="text-xs lg:text-xl font-helvetica-thin font-light leading-4 lg:leading-6 tracking-wider lg:tracking-wide mb-0 md:mb-2.25">
                                        508, Al Noor Business Center, King Fahd Road, Al Olaya District, PO Box 245671, Riyadh, Saudi Arabia
                                    </p>
                                </div>
                            </div>
                            <div className="block sm:hidden">
                                <ul className="flex gap-2 sm:gap-2 md:gap-1">
                                    <li>
                                        <Link href={"https://www.facebook.com/Eventifyentertainment/"}>
                                            <FacebookIcon />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={"https://www.instagram.com/eventifyentertainment/"}>
                                            <InstagramIcon />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={"https://ae.linkedin.com/company/eventifyentertainment"}>
                                            <LinkedInIcon />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="w-full 1-xl:w-1/2 flex justify-end">
                                <div className="w-full 1-xl:w-112.5">
                                    <p className="text-3xl md:text-[35px] font-abc-laica-a-italic-variable-trial font-medium leading-10 mb-1.5 md:mb-7">Join our Newsletter</p>

                                    <NewsLetter />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 sm:mt-8 lg:mt-10 xl:mt-16 1-xl:mt-20.75 flex items-start justify-between">
                    <div className="flex justify-between items-end w-full">
                        <div className="w-full text-4xl md:text-7xl lg:text-[85px] xl:text-[154px] text-white leading-9 md:leading-18 lg:leading-21.25 xl:leading-38.5 font-helvetica-heavy font-extrabold uppercase flex gap-1 xs:gap-x-1.5 sm:gap-x-3 md:gap-x-4 xl:gap-x-7 lg:flex items-start md:items-center flex-wrap">
                            <div>lets</div>
                            <div className="flex items-end justify-between w-full sm:w-fit lg:w-fit">
                                <div className="flex items-center gap-0">
                                    <span>ev </span>
                                    <span className="block w-9 md:w-20 xl:w-34 h-9 md:h-20 xl:h-36 -translate-y-1.25 md:-translate-y-3.5 lg:-translate-y-3.5">
                                        <Image
                                            src="https://res.cloudinary.com/afdhm38k/image/upload/v1787055266/favicon_bl7tpm.png"
                                            alt="Eventify light logo"
                                            width={1000}
                                            height={1000}
                                            className="w-full h-full object-contain"
                                        />
                                    </span>
                                    <span>ntify!</span>
                                </div>
                                {/* <div className="block sm:hidden">
                                    <ul className="flex gap-1 -translate-y-1.25">
                                        <li>
                                            <Link href={"https://www.facebook.com/Eventifyentertainment/"}>
                                                <FacebookIcon />
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={"https://www.instagram.com/eventifyentertainment/"}>
                                                <InstagramIcon />
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={"https://ae.linkedin.com/company/eventifyentertainment"}>
                                                <LinkedInIcon />
                                            </Link>
                                        </li>
                                    </ul>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 sm:w-7 md:w-8 h-5 sm:h-7 md:h-8 fill-white md:-translate-y-1">
            <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 sm:w-5.5 md:w-6 lg:w-7 h-5 sm:h-5.5 md:h-6 lh:h-7 fill-white stroke-white" strokeWidth={0.25} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.2c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.02-3.58.07-4.85c.15-3.23 1.67-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.28 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.72 21.3.28 16.95.07 15.67.01 15.26 0 12 0z" />
            <path d="M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zM19.85 5.6a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 sm:w-5.5 md:w-6 lg:w-7.5 h-5 sm:h-5.5 md:h-6 lh:h-7.5 fill-white stroke-white" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    );
}
