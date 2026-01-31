"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getUserByInviteCode, addFriend, signUp, signIn } from "@/lib/auth";
import { UtensilsCrossed, UserPlus, ArrowRight, CheckCircle2 } from "lucide-react";

interface InviteUser { id: string; nickname: string; }

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [inviter, setInviter] = useState<InviteUser | null>(null);
  const [error, setError] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getUserByInviteCode(code)
      .then((u) => setInviter(u))
      .catch(() => setError("유효하지 않은 초대 링크입니다"));
  }, [code]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inviter) return;
    setLoading(true);
    setError("");
    try {
      const stored = localStorage.getItem("user");
      let currentUser;
      if (stored) {
        currentUser = JSON.parse(stored);
      } else {
        currentUser = isSignUp ? await signUp(nickname, password) : await signIn(nickname, password);
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
      await addFriend(currentUser.id, inviter.id);
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  const loggedIn = typeof window !== "undefined" && localStorage.getItem("user");

  if (error && !inviter) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="animate-gradient fixed inset-0 bg-gradient-to-br from-brand-100 via-white to-accent-light" />
        <div className="glass-strong relative z-10 rounded-2xl p-8 text-center shadow-xl">
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="animate-gradient fixed inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50" />
        <div className="animate-slide-up glass-strong relative z-10 rounded-2xl p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-bold text-gray-900">친구 추가 완료!</p>
          <p className="mt-1 text-sm text-gray-500">대시보드로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="animate-gradient fixed inset-0 bg-gradient-to-br from-brand-100 via-white to-accent-light" />
      <div className="animate-float fixed top-20 -left-20 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="animate-float fixed -right-20 bottom-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 w-full max-w-sm">
        <div className="animate-fade-in mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30">
            <UtensilsCrossed className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">점심먹자</h1>
          {inviter && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm text-brand-700">
              <UserPlus className="h-4 w-4" />
              <span className="font-semibold">{inviter.nickname}</span>님이 초대했습니다
            </div>
          )}
        </div>

        <div className="glass-strong animate-slide-up rounded-2xl p-6 shadow-xl shadow-black/5">
          {loggedIn ? (
            <button
              onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
              disabled={loading}
              className="btn-press group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  친구 추가하기
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <input type="text" placeholder="콜사인" value={nickname} onChange={(e) => setNickname(e.target.value)} required className="w-full rounded-xl border-0 bg-gray-100/80 px-4 py-3.5 text-gray-900 placeholder-gray-400 ring-1 ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} className="w-full rounded-xl border-0 bg-gray-100/80 px-4 py-3.5 text-gray-900 placeholder-gray-400 ring-1 ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              </div>

              {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

              <button type="submit" disabled={loading} className="btn-press group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:shadow-xl disabled:opacity-50">
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {isSignUp ? "가입 + 친구추가" : "로그인 + 친구추가"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">또는</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="btn-press w-full rounded-xl bg-gray-100/80 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200/80">
                {isSignUp ? "이미 계정이 있나요?" : "처음이신가요? 가입하기"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
