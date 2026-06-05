export default function ProjectsLoader() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="relative rounded-lg border bg-card p-2.5">
                    <div className="animate-pulse">
                        {/* top action button */}
                        <div className="absolute top-2 right-2 z-30">
                            <div className="h-6 w-6 rounded-md bg-muted" />
                        </div>

                        <div className="relative flex flex-row items-center space-x-3 z-10">
                            {/* image */}
                            <div className="h-22 w-full rounded-lg bg-muted" />

                            {/* content */}
                            <div className="flex flex-col justify-center space-y-2 border-l pl-3 w-full">
                                {/* title */}
                                <div className="h-5 w-24 rounded bg-muted" />

                                {/* description */}
                                <div className="space-y-1">
                                    <div className="h-3 w-32 rounded bg-muted" />
                                    <div className="h-3 w-24 rounded bg-muted" />
                                </div>
                            </div>

                            {/* category badge */}
                            <div className="absolute w-20 h-7 -left-2.5 -top-5 rounded-xl bg-muted z-20" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
