interface HeadingWithoutLogoProps {
    title: string;
}
export default function HeadingWithoutLogo({ title }: HeadingWithoutLogoProps) {
    return <h2 className="mb-3 md:mb-3 lg:mb-3 text-xl md:text-2xl lg:text-4xl font-medium tracking-widest font-helvetica uppercase border-b-2 border-slate-800 w-fit text-slate-800">{title}</h2>;
}
