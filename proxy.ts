import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // allow login/register
    if (pathname.startsWith("/dashboard/login") || pathname.startsWith("/dashboard/register")) {
        return NextResponse.next();
    }

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token && pathname.startsWith("/dashboard")) {
        const loginUrl = new URL("/dashboard/login", req.url);

        loginUrl.searchParams.set("callbackUrl", pathname);

        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
