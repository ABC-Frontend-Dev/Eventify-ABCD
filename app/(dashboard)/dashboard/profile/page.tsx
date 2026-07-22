// app/(dashboard)/dashboard/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfilePage from "@/components/dashboard/layout/profile/ProfilePage";

export const metadata = {
    title: "My Profile - Eventify Dashboard",
};

export default async function Page() {
    // Server-side auth check
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/dashboard/login");
    }

    return <ProfilePage />;
}
