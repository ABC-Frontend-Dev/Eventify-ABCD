import TeamForm from "@/components/dashboard/layout/team/TeamForm";

export const metadata = {
    title: "Add Team Member",
};

export default function Page() {
    return <TeamForm mode="create" />;
}
