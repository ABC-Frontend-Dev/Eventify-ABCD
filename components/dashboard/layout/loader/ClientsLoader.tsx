export default function ClientsLoader() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg border bg-card p-4">
                    <div className="flex flex-col items-center space-y-4 animate-pulse">
                        {/* top action button */}
                        <div className="flex w-full justify-end">
                            <div className="h-5 w-5 rounded bg-muted" />
                        </div>

                        {/* logo */}
                        <div className="h-16 w-40 rounded-md bg-muted" />

                        {/* divider */}
                        <div className="h-px w-full bg-border" />

                        {/* text */}
                        <div className="flex w-full flex-col items-center space-y-2">
                            <div className="h-5 w-28 rounded bg-muted" />
                            <div className="h-4 w-40 rounded bg-muted" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
