import { GoesOutComesInUnderline } from "@/components/ui/underline-animation";
import Image from "next/image";
import Link from "next/link";
import SocialIcon from "@/components/ui/SocialIcon";

export default function Footer() {
    return (
        <footer className="bg-footer-bg">
            <div className="max-w-360 w-full mx-auto px-5 lg:px-20 py-9">
                <div>
                    <figure className="w-56 h-9">
                        <Image src="/images/logo-light.png" alt="Eventify light logo" width={1000} height={1000} className="w-full h-full object-contain" />
                    </figure>
                </div>

                <div className="mt-8 lg:mt-20.75 text-white">
                    <h2 className="text-xl lg:text-2xl font-helvetica leading-7.5 uppercase pb-5 border-b border-slate-600">OUR OFFICES</h2>

                    <div className="mt-5 flex items-start flex-col sm:flex-row gap-5.25 max-w-5xl w-full">
                        <div className="w-full sm:w-1/2">
                            <h2 className="text-lg lg:text-2xl font-helvetica-bold tracking-[1.5px] font-bold leading-6 lg:leading-7.5 uppercase mb-1 lg:mb-2">uae</h2>
                            <h3 className="text-sm lg:text-xl leading-4.5 font-helvetica-neue-roman lg:font-helvetica-medium tracking-[1px] font-bold lg:leading-6 mb-1.5 lg:mb-2.25">Address:</h3>
                            <p className="text-xs lg:text-xl font-helvetica-thin font-light leading-4 lg:leading-6 tracking-wider lg:tracking-wide mb-2.25">
                                508, API Business Suite, Al Barsha 1, PO Box 449832, Dubai, UAE
                            </p>
                        </div>
                        <div className="w-full sm:w-1/2">
                            <h2 className="text-lg lg:text-2xl font-helvetica-bold tracking-[1.5px] font-bold leading-6 lg:leading-7.5 uppercase mb-1 lg:mb-2">ksa</h2>
                            <h3 className="text-sm lg:text-xl font-helvetica-neue-roman lg:font-helvetica-medium tracking-[1px] font-bold leading-4.5 lg:leading-6  mb-1.5 lg:mb-2.25">Address:</h3>
                            <p className="text-xs lg:text-xl font-helvetica-thin font-light leading-4 lg:leading-6 tracking-wider lg:tracking-wide mb-2.25">
                                508, Al Noor Business Center, King Fahd Road, Al Olaya District, PO Box 245671, Riyadh, Saudi Arabia
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 lg:mt-20.75 text-white">
                    <div className="hidden md:flex items-center justify-between">
                        <h2 className="text-xl lg:text-2xl font-helvetica leading-6 lg:leading-7.5 uppercase">
                            Contact us
                            <span className="ml-4.75 font-product-sans-regular text-sm lg:text-xl leading-7 tracking-wider">
                                <span className="capitalize">Email ID: </span>
                                <Link href="#" className="lowercase">
                                    <GoesOutComesInUnderline label="connect@eventifyentertainment.com" direction="right" />
                                </Link>
                            </span>
                        </h2>

                        <div className="flex gap-0 md:gap-5">
                            {/* width="34" height="34" */}
                            <SocialIcon href="https://www.instagram.com/eventifyentertainment/" label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" className="w-5 sm:w-8.5 h-5 sm:h-8.5" fill="none">
                                    <g clipPath="url(#clip0_1_2400)">
                                        <path
                                            d="M25.5 -0.000976562H8.49967C3.80758 -0.000976562 -0.000488281 3.8071 -0.000488281 8.49919V25.4995C-0.000488281 30.1916 3.80758 33.9997 8.49967 33.9997H25.5C30.1921 33.9997 34.0002 30.1916 34.0002 25.4995V8.49919C34.0002 3.8071 30.1921 -0.000976562 25.5 -0.000976562ZM16.9998 25.4995C12.3077 25.4995 8.49967 21.6914 8.49967 16.9993C8.49967 12.3073 12.3077 8.49919 16.9998 8.49919C21.6919 8.49919 25.5 12.3073 25.5 16.9993C25.5 21.6914 21.6919 25.4995 16.9998 25.4995ZM26.095 9.55321C25.16 9.55321 24.395 8.78819 24.395 7.85317C24.395 6.91816 25.16 6.15314 26.095 6.15314C27.03 6.15314 27.795 6.91816 27.795 7.85317C27.795 8.78819 27.03 9.55321 26.095 9.55321Z"
                                            fill="white"
                                        />
                                        <path
                                            d="M16.9995 22.1006C19.8162 22.1006 22.0996 19.8172 22.0996 17.0005C22.0996 14.1838 19.8162 11.9004 16.9995 11.9004C14.1828 11.9004 11.8994 14.1838 11.8994 17.0005C11.8994 19.8172 14.1828 22.1006 16.9995 22.1006Z"
                                            fill="white"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_1_2400">
                                            <rect width="34" height="34" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </SocialIcon>

                            <SocialIcon href="https://www.linkedin.com/company/eventifyentertainment/" label="LinkedIn">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-8.5 h-5 sm:h-8.5" viewBox="0 0 34 34" fill="none">
                                    <g clipPath="url(#clip0_1_2404)">
                                        <path
                                            d="M29.3636 0H4.63636C3.40672 0 2.22745 0.488473 1.35796 1.35796C0.488473 2.22745 0 3.40672 0 4.63636L0 29.3636C0 30.5933 0.488473 31.7726 1.35796 32.642C2.22745 33.5115 3.40672 34 4.63636 34H29.3636C30.5933 34 31.7726 33.5115 32.642 32.642C33.5115 31.7726 34 30.5933 34 29.3636V4.63636C34 3.40672 33.5115 2.22745 32.642 1.35796C31.7726 0.488473 30.5933 0 29.3636 0ZM11.5909 26.9064C11.5912 27.0006 11.5728 27.094 11.5369 27.1812C11.501 27.2684 11.4483 27.3476 11.3817 27.4144C11.3151 27.4812 11.236 27.5341 11.1489 27.5703C11.0618 27.6064 10.9685 27.625 10.8742 27.625H7.82C7.72556 27.6253 7.63199 27.6068 7.54469 27.5708C7.45738 27.5348 7.37806 27.4819 7.31128 27.4151C7.2445 27.3483 7.19157 27.269 7.15555 27.1817C7.11952 27.0944 7.10111 27.0008 7.10136 26.9064V14.1023C7.10136 13.9117 7.17708 13.7289 7.31185 13.5941C7.44662 13.4593 7.62941 13.3836 7.82 13.3836H10.8742C11.0645 13.3841 11.2468 13.4601 11.3811 13.5948C11.5155 13.7295 11.5909 13.912 11.5909 14.1023V26.9064ZM9.34614 12.1705C8.77302 12.1705 8.21277 12.0005 7.73625 11.6821C7.25972 11.3637 6.88831 10.9111 6.66899 10.3816C6.44966 9.85215 6.39228 9.26951 6.50409 8.70741C6.6159 8.1453 6.89188 7.62898 7.29713 7.22372C7.70239 6.81847 8.21871 6.54249 8.78082 6.43068C9.34292 6.31887 9.92556 6.37625 10.455 6.59558C10.9845 6.8149 11.4371 7.18631 11.7555 7.66284C12.0739 8.13937 12.2439 8.69961 12.2439 9.27273C12.2439 10.0413 11.9386 10.7783 11.3951 11.3217C10.8517 11.8652 10.1147 12.1705 9.34614 12.1705ZM27.5555 26.9566C27.5557 27.0434 27.5388 27.1295 27.5057 27.2097C27.4726 27.29 27.4239 27.3629 27.3625 27.4243C27.3011 27.4857 27.2282 27.5344 27.1479 27.5675C27.0676 27.6006 26.9816 27.6175 26.8948 27.6173H23.6107C23.5238 27.6175 23.4378 27.6006 23.3575 27.5675C23.2773 27.5344 23.2043 27.4857 23.1429 27.4243C23.0815 27.3629 23.0329 27.29 22.9998 27.2097C22.9667 27.1295 22.9497 27.0434 22.95 26.9566V20.9583C22.95 20.0619 23.2127 17.0328 20.6067 17.0328C18.588 17.0328 18.1765 19.1057 18.0953 20.0368V26.9643C18.0954 27.1379 18.0271 27.3045 17.9053 27.4281C17.7834 27.5517 17.6179 27.6225 17.4443 27.625H14.2723C14.1856 27.625 14.0998 27.6079 14.0197 27.5747C13.9397 27.5414 13.867 27.4927 13.8058 27.4314C13.7446 27.37 13.6961 27.2971 13.6631 27.217C13.6301 27.1369 13.6133 27.051 13.6135 26.9643V14.0462C13.6133 13.9596 13.6301 13.8737 13.6631 13.7936C13.6961 13.7134 13.7446 13.6406 13.8058 13.5792C13.867 13.5178 13.9397 13.4691 14.0197 13.4359C14.0998 13.4027 14.1856 13.3856 14.2723 13.3856H17.4443C17.6195 13.3856 17.7876 13.4552 17.9115 13.5791C18.0354 13.703 18.105 13.871 18.105 14.0462V15.1628C18.8545 14.0366 19.9653 13.1711 22.3357 13.1711C27.5864 13.1711 27.5516 18.0741 27.5516 20.767L27.5555 26.9566Z"
                                            fill="white"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_1_2404">
                                            <rect width="34" height="34" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </SocialIcon>
                        </div>
                    </div>
                    <div className="block md:hidden">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl lg:text-2xl font-helvetica leading-6 lg:leading-7.5 uppercase">Contact us</h2>
                            <div className="flex gap-0 md:gap-5">
                                {/* width="34" height="34" */}
                                <SocialIcon href="https://www.instagram.com/eventifyentertainment/" label="Instagram">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" className="w-5 sm:w-8.5 h-5 sm:h-8.5" fill="none">
                                        <g clipPath="url(#clip0_1_2400)">
                                            <path
                                                d="M25.5 -0.000976562H8.49967C3.80758 -0.000976562 -0.000488281 3.8071 -0.000488281 8.49919V25.4995C-0.000488281 30.1916 3.80758 33.9997 8.49967 33.9997H25.5C30.1921 33.9997 34.0002 30.1916 34.0002 25.4995V8.49919C34.0002 3.8071 30.1921 -0.000976562 25.5 -0.000976562ZM16.9998 25.4995C12.3077 25.4995 8.49967 21.6914 8.49967 16.9993C8.49967 12.3073 12.3077 8.49919 16.9998 8.49919C21.6919 8.49919 25.5 12.3073 25.5 16.9993C25.5 21.6914 21.6919 25.4995 16.9998 25.4995ZM26.095 9.55321C25.16 9.55321 24.395 8.78819 24.395 7.85317C24.395 6.91816 25.16 6.15314 26.095 6.15314C27.03 6.15314 27.795 6.91816 27.795 7.85317C27.795 8.78819 27.03 9.55321 26.095 9.55321Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M16.9995 22.1006C19.8162 22.1006 22.0996 19.8172 22.0996 17.0005C22.0996 14.1838 19.8162 11.9004 16.9995 11.9004C14.1828 11.9004 11.8994 14.1838 11.8994 17.0005C11.8994 19.8172 14.1828 22.1006 16.9995 22.1006Z"
                                                fill="white"
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1_2400">
                                                <rect width="34" height="34" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </SocialIcon>

                                <SocialIcon href="https://www.linkedin.com/company/eventifyentertainment/" label="LinkedIn">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-8.5 h-5 sm:h-8.5" viewBox="0 0 34 34" fill="none">
                                        <g clipPath="url(#clip0_1_2404)">
                                            <path
                                                d="M29.3636 0H4.63636C3.40672 0 2.22745 0.488473 1.35796 1.35796C0.488473 2.22745 0 3.40672 0 4.63636L0 29.3636C0 30.5933 0.488473 31.7726 1.35796 32.642C2.22745 33.5115 3.40672 34 4.63636 34H29.3636C30.5933 34 31.7726 33.5115 32.642 32.642C33.5115 31.7726 34 30.5933 34 29.3636V4.63636C34 3.40672 33.5115 2.22745 32.642 1.35796C31.7726 0.488473 30.5933 0 29.3636 0ZM11.5909 26.9064C11.5912 27.0006 11.5728 27.094 11.5369 27.1812C11.501 27.2684 11.4483 27.3476 11.3817 27.4144C11.3151 27.4812 11.236 27.5341 11.1489 27.5703C11.0618 27.6064 10.9685 27.625 10.8742 27.625H7.82C7.72556 27.6253 7.63199 27.6068 7.54469 27.5708C7.45738 27.5348 7.37806 27.4819 7.31128 27.4151C7.2445 27.3483 7.19157 27.269 7.15555 27.1817C7.11952 27.0944 7.10111 27.0008 7.10136 26.9064V14.1023C7.10136 13.9117 7.17708 13.7289 7.31185 13.5941C7.44662 13.4593 7.62941 13.3836 7.82 13.3836H10.8742C11.0645 13.3841 11.2468 13.4601 11.3811 13.5948C11.5155 13.7295 11.5909 13.912 11.5909 14.1023V26.9064ZM9.34614 12.1705C8.77302 12.1705 8.21277 12.0005 7.73625 11.6821C7.25972 11.3637 6.88831 10.9111 6.66899 10.3816C6.44966 9.85215 6.39228 9.26951 6.50409 8.70741C6.6159 8.1453 6.89188 7.62898 7.29713 7.22372C7.70239 6.81847 8.21871 6.54249 8.78082 6.43068C9.34292 6.31887 9.92556 6.37625 10.455 6.59558C10.9845 6.8149 11.4371 7.18631 11.7555 7.66284C12.0739 8.13937 12.2439 8.69961 12.2439 9.27273C12.2439 10.0413 11.9386 10.7783 11.3951 11.3217C10.8517 11.8652 10.1147 12.1705 9.34614 12.1705ZM27.5555 26.9566C27.5557 27.0434 27.5388 27.1295 27.5057 27.2097C27.4726 27.29 27.4239 27.3629 27.3625 27.4243C27.3011 27.4857 27.2282 27.5344 27.1479 27.5675C27.0676 27.6006 26.9816 27.6175 26.8948 27.6173H23.6107C23.5238 27.6175 23.4378 27.6006 23.3575 27.5675C23.2773 27.5344 23.2043 27.4857 23.1429 27.4243C23.0815 27.3629 23.0329 27.29 22.9998 27.2097C22.9667 27.1295 22.9497 27.0434 22.95 26.9566V20.9583C22.95 20.0619 23.2127 17.0328 20.6067 17.0328C18.588 17.0328 18.1765 19.1057 18.0953 20.0368V26.9643C18.0954 27.1379 18.0271 27.3045 17.9053 27.4281C17.7834 27.5517 17.6179 27.6225 17.4443 27.625H14.2723C14.1856 27.625 14.0998 27.6079 14.0197 27.5747C13.9397 27.5414 13.867 27.4927 13.8058 27.4314C13.7446 27.37 13.6961 27.2971 13.6631 27.217C13.6301 27.1369 13.6133 27.051 13.6135 26.9643V14.0462C13.6133 13.9596 13.6301 13.8737 13.6631 13.7936C13.6961 13.7134 13.7446 13.6406 13.8058 13.5792C13.867 13.5178 13.9397 13.4691 14.0197 13.4359C14.0998 13.4027 14.1856 13.3856 14.2723 13.3856H17.4443C17.6195 13.3856 17.7876 13.4552 17.9115 13.5791C18.0354 13.703 18.105 13.871 18.105 14.0462V15.1628C18.8545 14.0366 19.9653 13.1711 22.3357 13.1711C27.5864 13.1711 27.5516 18.0741 27.5516 20.767L27.5555 26.9566Z"
                                                fill="white"
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1_2404">
                                                <rect width="34" height="34" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </SocialIcon>
                            </div>
                        </div>
                        <span className="font-product-sans-regular text-sm lg:text-xl leading-7 tracking-wider">
                            <span className="capitalize">Email ID: </span>
                            <Link href="#" className="lowercase text-xs">
                                <GoesOutComesInUnderline label="connect@eventifyentertainment.com" direction="right" />
                            </Link>
                        </span>
                    </div>
                </div>

                <div className="mt-2.5 flex items-start gap-5.25">
                    <div className="hidden text-8xl lg:text-[155px] leading-41.25 font-helvetica-heavy font-extrabold uppercase text-white lg:flex lg:items-start">
                        <span className="shrink-0">lets ev</span>
                        <span className="w-31 shrink-0">
                            <Image src="/images/favicon.png" alt="Eventify light logo" width={1000} height={1000} className="w-full h-full object-contain" />
                        </span>
                        <span>
                            ntif<span className="pl1">y</span>!
                        </span>
                    </div>
                    <div className="w-full text-4xl text-white leading-14 font-helvetica-heavy font-extrabold uppercase flex lg:hidden items-start flex-wrap">
                        <div>lets</div>
                        <div className="flex items-center gap-2">
                            <span>ev </span>
                            <span className="block w-10 h-12 -translate-y-2">
                                <Image src="/images/favicon.png" alt="Eventify light logo" width={1000} height={1000} className="w-full h-full object-contain" />
                            </span>
                            <span>ntify!</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
