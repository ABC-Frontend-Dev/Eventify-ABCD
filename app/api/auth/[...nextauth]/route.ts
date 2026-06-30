import NextAuth, { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Add this to help with debugging
export const runtime = "nodejs"; // Ensure it runs on Node.js runtime
