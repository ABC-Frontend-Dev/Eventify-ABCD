// proxy.ts (at the root of your project)
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
    const token = await getToken({ req });
    const isAuth = !!token;

    const { pathname } = req.nextUrl;

    const isProtected = pathname.startsWith("/dashboard");

    if (isProtected && !isAuth) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/dashboard/:path*"],
};
