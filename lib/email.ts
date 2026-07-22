import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function sendOTPEmail(email: string, otp: string) {
    try {
        await transporter.sendMail({
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: "Your OTP for Password Reset - Eventify",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Your OTP for password reset is:</p>
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h1 style="color: #000; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p style="color: #666;">This OTP is valid for 5 minutes only.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return false;
    }
}
