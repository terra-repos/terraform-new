"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LandingPageClient() {
  const router = useRouter();
  const [authView, setAuthView] = useState<"default" | "signin" | "reset">(
    "default"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL!;

  return (
    <div className="fixed inset-0 overflow-hidden bg-white flex items-center justify-center px-4 sm:px-6">
      {/* Background video */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={`${IMAGE_BASE_URL}/uploads/manufacturing.mp4`}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-white/30" />
      </div>

      {/* Hide header on home */}
      <style jsx global>{`
        header[data-terra-header] {
          display: none !important;
        }
      `}</style>

      {/* Content */}
      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/20 bg-white/30 backdrop-blur-xs shadow-md p-0 overflow-hidden">
        <div className="px-8 py-10 sm:px-10 sm:py-12">
          {/* Brand */}
          <div className="flex flex-col items-center gap-4 text-center">
            <Image
              src="/terra_icon.svg"
              alt="Terra logo"
              width={64}
              height={64}
              priority
            />
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-gray-900">
              Terra
            </h1>
          </div>

          {/* Tagline */}
          <p className="mt-6 max-w-2xl mx-auto text-black text-lg text-center">
            Launch your home goods brand.
          </p>

          {/* Actions, Sign-in, or Reset Password */}
          {authView === "default" ? (
            <div className="mt-10 flex flex-col gap-3">
              <Button
                className="h-11 w-full cursor-pointer"
                onClick={() => router.push("/onboard?signUp=1")}
              >
                Get started
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full cursor-pointer"
                onClick={() => setAuthView("signin")}
              >
                I already have an account
              </Button>
            </div>
          ) : authView === "signin" ? (
            <form
              className="mt-8 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setLoading(true);
                try {
                  const supabase = createClient();
                  const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                  });
                  if (error) {
                    setError(error.message || "Failed to sign in");
                    setLoading(false);
                  } else {
                    router.push("/home");
                    router.refresh();
                  }
                } catch (err: any) {
                  setError(err?.message || "Unexpected error");
                  setLoading(false);
                }
              }}
            >
              {error && (
                <div className="text-sm text-red-600 mb-2">{error}</div>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white/80"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white/80"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-gray-700">
                  <button
                    type="button"
                    onClick={() => router.push("/onboard?signUp=1")}
                    className="hover:text-gray-900 cursor-pointer"
                  >
                    Get started
                  </button>
                  <span className="mx-2 text-gray-400">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setAuthView("reset");
                    }}
                    className="hover:text-gray-900 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="h-11 px-6" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          ) : (
            // Reset password view
            <div className="mt-8 space-y-3">
              {resetSent ? (
                <div>
                  <div className="text-sm text-green-700 mb-2">
                    Reset link sent to {email}. Check your inbox.
                  </div>
                  <div className="pt-2 flex items-center justify-end">
                    <Button
                      type="button"
                      className="h-11 px-6"
                      onClick={() => {
                        setResetSent(false);
                        setAuthView("signin");
                        setError(null);
                      }}
                    >
                      Back to login
                    </Button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setError(null);
                    setLoading(true);
                    try {
                      const supabase = createClient();
                      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
                      const { error } =
                        await supabase.auth.resetPasswordForEmail(
                          email.trim(),
                          {
                            redirectTo: `${siteUrl}/auth/reset-password`,
                          } as any
                        );
                      if (error) {
                        setError(error.message || "Failed to send reset email");
                      } else {
                        setResetSent(true);
                      }
                    } catch (err: any) {
                      setError(err?.message || "Unexpected error");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {error && (
                    <div className="text-sm text-red-600 mb-2">{error}</div>
                  )}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white/80"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setAuthView("signin")}
                      className="text-xs text-gray-700 hover:text-gray-900 cursor-pointer"
                    >
                      Back to sign in
                    </button>
                    <Button
                      type="submit"
                      className="h-11 px-6"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send reset link"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
