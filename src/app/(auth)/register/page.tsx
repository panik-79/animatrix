"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/store/toast-store";
import { AuthLayout } from "@/components/auth/auth-layout";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const authError = searchParams.get("error");
    if (!authError) return;

    if (authError === "google_not_configured") {
      toast.warn(
        "Google OAuth Not Configured",
        "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file."
      );
    } else if (authError === "google_cancelled") {
      toast.info("Sign-In Cancelled", "Google authentication was cancelled.");
    } else if (authError === "google_auth_failed") {
      toast.error("Authentication Failed", "Failed to complete Google authentication.");
    } else if (authError === "csrf_state_mismatch" || authError === "invalid_oauth_response") {
      toast.error("Security Alert", "Invalid OAuth response state. Please try again.");
    }
  }, [searchParams]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-800" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-indigo-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.warn("Missing Fields", "Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      toast.warn("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Account Created", "Welcome to your anime companion.");
      router.push("/onboarding");
    } catch (err: any) {
      toast.error("Registration Error", err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    toast.info("Google Sign-In", "Redirecting to Google...");
    window.location.href = "/api/auth/google?from=/onboarding";
  };

  return (
    <div className="w-full max-w-[420px] bg-[rgba(12,16,24,0.60)] backdrop-blur-[22px] backdrop-saturate-[150%] border border-white/[0.07] rounded-[28px] p-8 sm:p-11 shadow-[0_24px_60px_rgba(0,0,0,0.65)] relative overflow-hidden space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center p-1 bg-[rgba(6,9,17,0.6)] rounded-xl border border-white/[0.04] text-xs font-medium text-slate-400">
        <Link
          href="/login"
          className="flex-1 py-2 rounded-lg hover:text-slate-200 transition-colors text-center font-medium"
        >
          Sign In
        </Link>
        <button
          type="button"
          className="flex-1 py-2 rounded-lg bg-[#161c2a] text-white font-semibold shadow-sm transition-all duration-200 text-center"
        >
          Create Account
        </button>
      </div>

      {/* Card Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
          Create Account
        </h2>
        <p className="text-xs text-slate-400 font-normal leading-relaxed">
          Join Animatrix to personalize recommendations and build your library.
        </p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-medium text-slate-300">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Otaku Fan"
            className="w-full px-4 py-3 text-xs bg-[rgba(8,11,18,0.7)] border border-white/[0.05] rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all duration-200"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium text-slate-300">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-4 py-3 text-xs bg-[rgba(8,11,18,0.7)] border border-white/[0.05] rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all duration-200"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-medium text-slate-300">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-4 pr-10 py-3 text-xs bg-[rgba(8,11,18,0.7)] border border-white/[0.05] rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Bar */}
          {password.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Strength: <strong className="text-slate-200">{strength.label}</strong></span>
                <span className="text-[10px] text-slate-500">Min. 6 chars</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1 w-full">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      step <= strength.score ? strength.color : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-700 text-white font-medium text-[13px] rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.35)] transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <span className="relative bg-[#0b0e17] px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          or
        </span>
      </div>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-medium text-xs rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Footer Switcher */}
      <div className="text-center pt-2 text-xs text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-white font-medium hover:underline ml-1">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="w-full max-w-[420px] h-96 bg-[rgba(12,16,24,0.70)] backdrop-blur-[18px] animate-pulse rounded-[28px]" />}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
