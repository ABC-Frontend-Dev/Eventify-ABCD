// app/api/auth/password/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyOTP, getOTPRecord } from "@/lib/otp-cache";

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        // Validate input
        if (!email || !otp) {
            return NextResponse.json({ success: false, error: "Email and OTP are required" }, { status: 400 });
        }

        // Trim and normalize the OTP (remove any spaces)
        const normalizedOtp = otp.trim().replace(/\s/g, "");

        // Check if OTP is 6 digits
        if (normalizedOtp.length !== 6 || !/^\d{6}$/.test(normalizedOtp)) {
            return NextResponse.json({ success: false, error: "OTP must be 6 digits" }, { status: 400 });
        }

        // Get the stored OTP record for debugging
        const record = getOTPRecord(email);

        console.log("🔍 OTP Verification Debug:");
        console.log("Email:", email);
        console.log("Received OTP:", normalizedOtp);
        console.log("Stored OTP:", record?.otp || "NOT FOUND");
        console.log("OTP Expired:", record ? record.expiresAt < Date.now() : "N/A");
        console.log("Attempts:", record?.attempts || 0);

        // Verify the OTP
        const isValid = verifyOTP(email, normalizedOtp);

        if (!isValid) {
            const updatedRecord = getOTPRecord(email);

            if (!updatedRecord) {
                return NextResponse.json({ success: false, error: "OTP expired or not found. Please request a new one." }, { status: 400 });
            }

            if (updatedRecord.attempts >= 3) {
                return NextResponse.json({ success: false, error: "Too many failed attempts. Please request a new OTP." }, { status: 400 });
            }

            return NextResponse.json({ success: false, error: "Invalid OTP. Please try again." }, { status: 400 });
        }

        console.log("✅ OTP verified successfully for:", email);

        return NextResponse.json({ success: true, message: "OTP verified successfully" }, { status: 200 });
    } catch (error) {
        console.error("🔥 OTP Verification Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
