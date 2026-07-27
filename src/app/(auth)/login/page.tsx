"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/store/toast-store";
import { AuthLayout } from "@/components/auth/auth-layout";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn("Missing Fields", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success("Signed In", `Signed in as ${data.user.name}`);

      if (!data.user.isOnboarded) {
        router.push("/onboarding");
      } else {
        router.push(from);
      }
    } catch (err: any) {
      toast.error("Authentication Error", err.message || "Failed to log in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    toast.info("Google Sign-In", "Redirecting to Google authentication...");
    setTimeout(() => {
      setIsGoogleLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-[420px] bg-[rgba(12,16,24,0.60)] backdrop-blur-[22px] backdrop-saturate-[150%] border border-white/[0.07] rounded-[28px] p-8 sm:p-11 shadow-[0_24px_60px_rgba(0,0,0,0.65)] relative overflow-hidden space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center p-1 bg-[rgba(6,9,17,0.6)] rounded-xl border border-white/[0.04] text-xs font-medium text-slate-400">
        <button
          type="button"
          className="flex-1 py-2 rounded-lg bg-[#161c2a] text-white font-semibold shadow-sm transition-all duration-200 text-center"
        >
          Sign In
        </button>
        <Link
          href="/register"
          className="flex-1 py-2 rounded-lg hover:text-slate-200 transition-colors text-center font-medium"
        >
          Create Account
        </Link>
      </div>

      {/* Card Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
          Sign In
        </h2>
        <p className="text-xs text-slate-400 font-normal leading-relaxed">
          Access your personal anime library, progress, and collections.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field (Filled dark input) */}
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

        {/* Password Field (Filled dark input with toggle) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="password" className="font-medium text-slate-300">
              Password
            </label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Password Reset", "Instructions sent to your email.");
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Forgot?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
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
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-700 text-white font-medium text-[13px] rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.35)] transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            "Sign In"
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
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-white font-medium hover:underline ml-1">
          Create account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="w-full max-w-[420px] h-96 bg-[rgba(12,16,24,0.70)] backdrop-blur-[18px] animate-pulse rounded-[28px]" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
