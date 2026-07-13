// middleware.ts (your proxy file)
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token && pathname.startsWith("/dashboard")) {
        // Redirect to /login with callbackUrl so after login
        // the user is sent back to where they were going
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Protect all /dashboard routes
    // /login is at the root so it is NOT matched here — no infinite redirect
    matcher: ["/dashboard/:path*"],
};
