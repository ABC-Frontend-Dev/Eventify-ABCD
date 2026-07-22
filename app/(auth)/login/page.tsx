// app/(auth)/login/page.tsx
"use client";

import { useState, useRef, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const submittingRef = useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (submittingRef.current) return;

        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            setError("Please enter both email and password.");
            return;
        }
        if (!EMAIL_REGEX.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        submittingRef.current = true;
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email: trimmedEmail,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password. Please try again.");
            } else if (result?.ok) {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
            submittingRef.current = false;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                {/* brand */}
                <div className="flex items-center gap-2.5 justify-center mb-8">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">E</div>
                    <div>
                        <p className="text-sm font-semibold leading-none text-slate-900 tracking-tight">Eventify</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Admin console</p>
                    </div>
                </div>

                {/* card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="mb-5">
                        <h1 className="text-base font-semibold text-slate-900">Sign in to your account</h1>
                        <p className="mt-0.5 text-xs text-slate-400">Enter your credentials below to continue</p>
                    </div>

                    {error && (
                        <div role="alert" aria-live="polite" className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                            <span className="shrink-0 text-red-500 text-xs mt-0.5">⚠</span>
                            <p className="text-xs text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* email */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@eventify.com"
                                    required
                                    autoComplete="username"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    maxLength={254}
                                    disabled={isLoading}
                                    className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-400 placeholder:text-slate-300 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* password */}
                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    maxLength={128}
                                    disabled={isLoading}
                                    className="w-full h-9 pl-9 pr-9 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-400 placeholder:text-slate-300 disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    disabled={isLoading}
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                                >
                                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>

                        {/* submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-9 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Signing in…
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-4 text-center text-[11px] text-slate-400">Eventify Admin · {new Date().getFullYear()}</p>
            </div>
        </div>
    );
}

function LoginPageSuspense() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}

export default LoginPageSuspense;
