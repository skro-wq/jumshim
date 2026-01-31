"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth";
import { UtensilsCrossed, ArrowRight, UserPlus, LogIn } from "lucide-react";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = isSignUp
        ? await signUp(nickname, password)
        : await signIn(nickname, password);

      localStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Animated gradient background */}
      <div className="animate-gradient fixed inset-0 bg-gradient-to-br from-brand-100 via-white to-accent-light" />

      {/* Decorative blobs */}
      <div className="animate-float fixed top-20 -left-20 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="animate-float fixed -right-20 bottom-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo & Title */}
        <div className="animate-fade-in mb-10 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30">
            <UtensilsCrossed className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            점심먹자
          </h1>
        </div>

        {/* Form Card */}
        <div className="glass-strong animate-slide-up rounded-2xl p-6 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="콜사인"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="w-full rounded-xl border-0 bg-gray-100/80 px-4 py-3.5 text-gray-900 placeholder-gray-400 ring-1 ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                className="w-full rounded-xl border-0 bg-gray-100/80 px-4 py-3.5 text-gray-900 placeholder-gray-400 ring-1 ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-press group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:shadow-xl hover:shadow-brand-600/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {isSignUp ? "가입하기" : "로그인"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            className="btn-press mt-4 w-full rounded-xl bg-gray-100/80 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200/80"
          >
            {isSignUp ? "이미 계정이 있나요? 로그인" : "콜사인 생성"}
          </button>
        </div>

      </div>
    </div>
  );
}
