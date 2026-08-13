import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        email: string;
        name: string;
        role: "SUPER_ADMIN" | "ADMIN";
        firstName?: string;
        lastName?: string;
    }

    interface Session {
        user: User & {
            role: "SUPER_ADMIN" | "ADMIN";
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        name: string;
        role: "SUPER_ADMIN" | "ADMIN";
    }
}
