import Link from "next/link";
import Footer from "@/components/layout/Footer/Footer";
import Navbar from "@/components/layout/navbar/Navbar";
import Image from "next/image";

export const metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

const QUICK_LINKS = [
  {
    title: "Services",
    description: "Everything we do",
    href: "/#our-services",
  },
  {
    title: "Projects",
    description: "Explore our projects",
    href: "/#projects",
  },
  {
    title: "Blog",
    description: "Read our latest articles and insights",
    href: "/#blogs",
  },
];

/** The three tilted bars from the Eventify logo mark, used as the "0" in 404. */
function BarsMark() {
  const bars = [
    { y: 17, angle: -24 },
    { y: 44, angle: 10.5 },
    { y: 71, angle: 0 },
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="h-[0.72em] w-[0.72em] shrink-0 text-primary"
      fill="currentColor"
    >
      {bars.map((bar, i) => {
        const cy = bar.y + 6;
        return (
          <rect
            key={i}
            x="6"
            y={bar.y}
            width="88"
            height="12"
            transform={`rotate(0 50 ${cy})`}
          >
            {bar.angle !== 0 && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 50 ${cy}`}
                to={`${bar.angle} 50 ${cy}`}
                begin={`${0.2 + i * 0.12}s`}
                dur="0.9s"
                fill="freeze"
                calcMode="spline"
                keyTimes="0;1"
                keySplines="0.22 1 0.36 1"
              />
            )}
          </rect>
        );
      })}
    </svg>
  );
}

export default function NotFoundWithLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* <Navbar /> */}

      <main className="relative ">
        {/* <div className="w-full h-18 bg-footer-bg"></div> */}
        {/* Soft brand glow behind the content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden px-5 pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl sm:h-[560px] sm:w-[560px]"
          />

          <div className="relative w-full max-w-3xl text-center">
            <p className="font-helvetica-medium text-xs uppercase tracking-[0.25em] text-primary">
              Error 404
            </p>

            <h1 className="mt-5 flex items-center justify-center gap-1 font-helvetica-medium text-[104px] leading-none text-footer-bg sm:gap-2 sm:text-[150px] lg:text-[190px]">
              <span className="sr-only">404</span>
              <span aria-hidden="true">4</span>
              {/* <BarsMark /> */}
              <Image
                src="https://res.cloudinary.com/afdhm38k/image/upload/v1787046636/favicon_da2hkq.png"
                alt=""
                width={100}
                height={100}
                className="h-33.25 w-fit object-contain"
              />
              <span aria-hidden="true">4</span>
            </h1>

            <h2 className="mt-8 font-helvetica-neue-roman text-2xl leading-8 text-footer-bg sm:text-3xl sm:leading-10 lg:text-4xl">
              Oops! This page has{" "}
              <span className="whitespace-nowrap font-abc-laica-a-italic-variable-trial font-medium text-primary">
                left the venue
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-lg font-helvetica-neue-roman text-sm leading-6 tracking-wide text-slate-600 sm:text-base sm:leading-7">
              The page you&rsquo;re trying to access doesn&rsquo;t exist. It
              might have been moved or deleted.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center bg-primary px-8 font-helvetica-neue-roman text-sm text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                Back to Home
              </Link>
              <Link
                href="/#about-us"
                className="inline-flex h-11 w-full items-center justify-center border border-footer-bg/20 bg-white px-8 font-helvetica-neue-roman text-sm text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white sm:w-auto"
              >
                About Us
              </Link>
            </div>

            {/* Quick links */}
            <div className="mt-14 grid grid-cols-1 gap-3 border-t border-slate-200 pt-10 text-left sm:grid-cols-3 lg:mt-16">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="group border border-slate-200 p-5 transition-colors hover:border-primary"
                >
                  <span className="flex items-center justify-between">
                    <span className="font-abc-laica-a-italic-variable-trial text-xl font-medium text-footer-bg transition-colors group-hover:text-primary">
                      {link.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-primary transition-transform group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </span>
                  <span className="mt-1 block font-helvetica-neue-roman text-sm text-slate-500">
                    {link.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
