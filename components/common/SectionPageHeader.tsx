import React from 'react'

interface SectionHeaderProps {
    title: String;
    description: String;
}
function SectionPageHeader({ title, description }: SectionHeaderProps) {
    return (
        <div className="w-full xl:w-1/3">
            <h1 className="text-xl md:text-2xl lg:text-3xl leading-6 md:leading-7 lg:leading-8.5 font-medium font-abc-laica-a-italic-variable-trial mb-2">
                {title}
                {/* 3D Event Design, Fabrication & Build */}
            </h1>
            <p className="text-base font-helvetica-neue-roman leading-5 text-footer-bg text-left">
                {/* We transform creative concepts into extraordinary event environments through detailed 3D visualization, expert fabrication, and precision execution. Every element is crafted to
                        reflect the original vision with exceptional accuracy. */}
                {description}
            </p>
        </div>
    )
}

export default SectionPageHeader;