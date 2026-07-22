"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useToasts } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import { PinInput } from "@/components/base/input/pin-input";
import { REGEXP_ONLY_DIGITS } from "input-otp";

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
}

type Step = "request" | "verify" | "reset" | "success";

export default function PasswordChangeModal({ isOpen, onClose, userEmail }: PasswordChangeModalProps) {
    const toast = useToasts();
    const [step, setStep] = useState<Step>("request");
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [mounted, setMounted] = useState(false);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Mount effect
    useEffect(() => {
        setMounted(true);
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    // Timer for OTP expiration
    useEffect(() => {
        if (!mounted || step !== "verify" || !isOpen) {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            return;
        }

        timerIntervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerIntervalRef.current) {
                        clearInterval(timerIntervalRef.current);
                    }
                    toast.error("OTP expired");
                    setStep("request");
                    setTimeLeft(300);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [step, mounted, isOpen, toast]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStep("request");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeLeft(300);
        }
    }, [isOpen]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleRequestOTP = async () => {
        setLoading(true);
        try {
            const res = await axios.post("/api/auth/password/request-otp", {
                email: userEmail,
            });

            if (res.data.success) {
                toast.success("OTP sent to your email");
                setStep("verify");
                setTimeLeft(300);
            } else {
                toast.error(res.data.error);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to request OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("/api/auth/password/verify-otp", {
                email: userEmail,
                otp,
            });

            if (res.data.success) {
                toast.success("OTP verified");
                setStep("reset");
            } else {
                toast.error(res.data.error);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to verify OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Please enter both passwords");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("/api/auth/password/reset", {
                email: userEmail,
                newPassword,
            });

            if (res.data.success) {
                toast.success("Password reset successfully");
                setStep("success");
                setTimeout(() => {
                    onClose();
                    setStep("request");
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                }, 2000);
            } else {
                toast.error(res.data.error);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    // Handle modal close attempt
    const handleOpenChange = (newOpen: boolean) => {
        // If trying to close (newOpen = false) and we're on verify step, prevent it
        if (!newOpen && step === "verify") {
            toast.error("Please complete OTP verification or click 'Send OTP Again' to start over");
            return;
        }
        // Otherwise, allow close
        if (!newOpen) {
            onClose();
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-[425px]"
                // Prevent closing on outside click during OTP verification
                onPointerDownOutside={(e) => {
                    if (step === "verify") {
                        e.preventDefault();
                    }
                }}
                // Prevent closing on escape key during OTP verification
                onEscapeKeyDown={(e) => {
                    if (step === "verify") {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Secure your account by updating your password</DialogDescription>
                    </div>
                    {/* Custom close button that works during all steps */}
                    {/* <button
                        onClick={() => {
                            if (step === "verify") {
                                const shouldClose = confirm("Are you sure you want to cancel? You'll need to request a new OTP.");
                                if (!shouldClose) return;
                            }
                            onClose();
                        }}
                        className="ml-auto h-6 w-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button> */}
                </DialogHeader>

                {/* Step 1: Request OTP */}
                {step === "request" && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            We'll send an OTP to <strong>{userEmail}</strong>
                        </p>
                        <Button onClick={handleRequestOTP} disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Sending...
                                </>
                            ) : (
                                "Send OTP"
                            )}
                        </Button>
                    </div>
                )}

                {/* Step 2: Verify OTP */}
                {step === "verify" && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 font-helvetica tracking-wide">Enter the 6-digit OTP sent to your email</p>
                        <div>
                            <PinInput size="xs">
                                <PinInput.Label>Verification Code</PinInput.Label>
                                <PinInput.Group maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={otp} onChange={(value: string) => setOtp(value)}>
                                    <PinInput.Slot index={0} />
                                    <PinInput.Slot index={1} />
                                    <PinInput.Slot index={2} />
                                    <PinInput.Separator />
                                    <PinInput.Slot index={3} />
                                    <PinInput.Slot index={4} />
                                    <PinInput.Slot index={5} />
                                </PinInput.Group>
                                <PinInput.Description>Enter the 6-digit code from your email</PinInput.Description>
                            </PinInput>
                        </div>

                        <p className="text-xs text-slate-400 text-center font-helvetica tracking-wide">
                            Time remaining: <strong className={timeLeft < 60 ? "text-red-500" : ""}>{formatTime(timeLeft)}</strong>
                        </p>

                        <Button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify OTP"
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setStep("request");
                                setOtp("");
                            }}
                            className="w-full text-xs"
                            disabled={loading}
                        >
                            Send OTP Again
                        </Button>
                    </div>
                )}

                {/* Step 3: Reset Password */}
                {step === "reset" && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">Enter your new password</p>
                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" disabled={loading} />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" disabled={loading} />
                        </div>
                        {newPassword && confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-600">Passwords do not match</p>}
                        <Button onClick={handleResetPassword} disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === "success" && (
                    <div className="text-center space-y-3 py-4">
                        <div className="text-4xl">✅</div>
                        <p className="text-sm font-medium">Password changed successfully!</p>
                        <p className="text-xs text-slate-500">You can now log in with your new password.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
