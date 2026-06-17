import AnimatedFavicon from "../ui/AnimatedFavicon";

interface HeadingWithoutLogoProps {
    titlePart1?: string;
    titlePart2_1: string;
    titlePart2_2: string;
}
export default function HeadingWithLogo({ titlePart1, titlePart2_1, titlePart2_2 }: HeadingWithoutLogoProps) {
    return (
        <h2 className="mb-5 lg:mb-9 text-2xl lg:text-4xl tracking-widest font-medium font-helvetica uppercase border-b-2 border-slate-800 w-fit text-slate-800 flex flex-row items-center justify-center gap-2.5">
            {titlePart1}{" "}
            <span className="flex items-center justify-start gap-0.5">
                {titlePart2_1}
                <AnimatedFavicon />
                <span className="pl-0.5">{titlePart2_2}</span>
            </span>
        </h2>
    );
}
