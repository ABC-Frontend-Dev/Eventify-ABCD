import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    console.log("🔐 LOGIN ATTEMPT:", credentials?.email);

                    if (!credentials?.email || !credentials?.password) {
                        console.error("❌ Missing credentials");
                        return null;
                    }

                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    });

                    if (!user) {
                        console.error("❌ No user found with email:", credentials.email);
                        return null;
                    }

                    console.log("✅ User found:", user.email);

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        console.error("❌ Invalid password for:", credentials.email);
                        return null;
                    }

                    console.log("✅ Login successful:", user.email);

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: `${user.firstName} ${user.lastName}`,
                    };
                } catch (error) {
                    console.error("🔥 Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/dashboard/login",
        error: "/dashboard/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};
