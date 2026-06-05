interface DashboardHeaderProps {
    title: string;
    description?: string;
}
export default function DashboardHeader({ title, description }: DashboardHeaderProps) {
    return (
        <>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
        </>
    );
}
