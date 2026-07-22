// lib/otp-cache.ts
interface OTPRecord {
    otp: string;
    expiresAt: number;
    attempts: number;
}

const otpCache = new Map<string, OTPRecord>();

// Clean up expired OTPs every 5 minutes
setInterval(
    () => {
        const now = Date.now();
        for (const [email, record] of otpCache.entries()) {
            if (record.expiresAt < now) {
                console.log("🗑️ Cleaning up expired OTP for:", email);
                otpCache.delete(email);
            }
        }
    },
    5 * 60 * 1000,
);

export function generateOTP(): string {
    // Generate 6-digit OTP with leading zeros
    return Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");
}

export function storeOTP(email: string, otp: string): void {
    otpCache.set(email, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0,
    });
    console.log("💾 OTP Stored:", { email, otp, cacheSize: otpCache.size });
}

export function verifyOTP(email: string, otp: string): boolean {
    const record = otpCache.get(email);

    console.log("🔐 Verifying OTP:", { email, otp, found: !!record });

    if (!record) {
        console.log("❌ No OTP record found for:", email);
        return false;
    }

    if (record.expiresAt < Date.now()) {
        console.log("⏰ OTP expired for:", email);
        otpCache.delete(email);
        return false;
    }

    if (record.attempts >= 3) {
        console.log("🚫 Too many attempts for:", email);
        otpCache.delete(email);
        return false;
    }

    // Direct string comparison (case-sensitive, exact match)
    if (record.otp !== otp) {
        record.attempts++;
        console.log(`❌ OTP mismatch for ${email}. Attempts: ${record.attempts}/3`);
        console.log("Expected:", record.otp, "Got:", otp);
        return false;
    }

    console.log("✅ OTP verified for:", email);
    otpCache.delete(email);
    return true;
}

export function getOTPRecord(email: string): OTPRecord | undefined {
    return otpCache.get(email);
}

export function deleteOTP(email: string): void {
    otpCache.delete(email);
}
