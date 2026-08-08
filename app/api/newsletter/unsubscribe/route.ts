import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get("token");

        if (!token) {
            return new NextResponse(unsubscribePage("Invalid Link", "No unsubscribe token was provided."), { status: 400, headers: { "Content-Type": "text/html" } });
        }

        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { unsubscribeToken: token },
        });

        if (!subscriber) {
            return new NextResponse(unsubscribePage("Invalid Link", "This unsubscribe link is invalid or has already been used."), { status: 404, headers: { "Content-Type": "text/html" } });
        }

        if (!subscriber.isActive) {
            return new NextResponse(unsubscribePage("Already Unsubscribed", "You have already been unsubscribed from our newsletter."), { status: 200, headers: { "Content-Type": "text/html" } });
        }

        await prisma.newsletterSubscriber.update({
            where: { unsubscribeToken: token },
            data: {
                isActive: false,
                unsubscribedAt: new Date(),
            },
        });

        return new NextResponse(unsubscribePage("Successfully Unsubscribed", "You have been unsubscribed from the Eventify newsletter. We're sad to see you go!", true), {
            status: 200,
            headers: { "Content-Type": "text/html" },
        });
    } catch (error) {
        console.error("GET /api/newsletter/unsubscribe error:", error);
        return new NextResponse(unsubscribePage("Error", "Something went wrong. Please try again later."), { status: 500, headers: { "Content-Type": "text/html" } });
    }
}

function unsubscribePage(title: string, message: string, success = false): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} - Eventify</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#F4F4F4;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
  .card{background:#fff;border-radius:12px;padding:48px 40px;max-width:440px;width:100%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
  .icon{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px auto;font-size:28px}
  .success{background:#F0FDF4}
  .error{background:#FEF2F2}
  h1{font-size:22px;font-weight:700;color:#0F172A;margin-bottom:12px}
  p{font-size:15px;color:#64748B;line-height:1.6}
  a{display:inline-block;margin-top:28px;padding:12px 28px;background:#57068C;color:#fff;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600}
</style>
</head>
<body>
<div class="card">
  <div class="icon ${success ? "success" : "error"}">${success ? "✅" : "❌"}</div>
  <h1>${title}</h1>
  <p>${message}</p>
  <a href="https://eventifyentertainment.com">Back to Website</a>
</div>
</body>
</html>`;
}
