"use client";

import { X } from "lucide-react";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-[850px] rounded-lg bg-[#F4F4F4] px-8 py-10 md:px-12 md:py-12">
                {/* Close Button */}
                <button onClick={onClose} className="absolute right-6 top-6 cursor-pointer">
                    <X className="h-8 w-8 text-black" strokeWidth={1.5} />
                </button>

                {/* Heading */}
                <div>
                    <h2 className="text-[32px] font-bold uppercase leading-none text-[#2B2B2B] md:text-[52px]">Got A Project In Mind?</h2>

                    <h3 className="mt-1 text-[32px] font-bold uppercase leading-none text-[#5B1196] md:text-[52px]">Get In Touch</h3>

                    <p className="mt-3 text-base text-[#333] md:text-lg">We're here to answer any question you may have.</p>
                </div>

                {/* Contact Title */}
                <h4 className="mt-10 text-xl font-bold uppercase text-black">Contact Us</h4>

                {/* Form */}
                <form className="mt-8 space-y-10">
                    <div>
                        <input type="text" placeholder="NAME" className="w-full border-0 border-b border-[#444] bg-transparent pb-3 text-lg uppercase outline-none placeholder:text-[#4B5C73]" />
                    </div>

                    <div>
                        <input type="email" placeholder="EMAIL" className="w-full border-0 border-b border-[#444] bg-transparent pb-3 text-lg uppercase outline-none placeholder:text-[#4B5C73]" />
                    </div>

                    <div>
                        <input type="tel" placeholder="PHONE" className="w-full border-0 border-b border-[#444] bg-transparent pb-3 text-lg uppercase outline-none placeholder:text-[#4B5C73]" />
                    </div>

                    <div>
                        <textarea
                            rows={1}
                            placeholder="MESSAGE"
                            className="w-full resize-none border-0 border-b border-[#444] bg-transparent pb-3 text-lg uppercase outline-none placeholder:text-[#4B5C73]"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="mt-4 flex h-[72px] w-full items-center justify-center rounded-full bg-[#252525] text-xl font-bold uppercase text-white transition hover:opacity-90"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}
