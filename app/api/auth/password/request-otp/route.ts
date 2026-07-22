// app/api/auth/password/request-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/otp-cache";
import { sendOTPEmail } from "@/lib/email";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // Generate OTP
        const otp = generateOTP();
        console.log("📧 Generated OTP for", email, ":", otp);

        // Store OTP in cache
        storeOTP(email, otp);

        // Send OTP via email
        const emailSent = await sendOTPEmail(email, otp);

        if (!emailSent) {
            return NextResponse.json({ success: false, error: "Failed to send OTP email" }, { status: 500 });
        }

        console.log("✅ OTP sent to", email);

        return NextResponse.json(
            {
                success: true,
                message: "OTP sent successfully",
                // Only for development - remove in production
                ...(process.env.NODE_ENV === "development" && { debug: { otp } }),
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("🔥 Request OTP Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
