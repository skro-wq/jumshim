"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NEIGHBORHOODS, DAY_NAMES } from "@/lib/neighborhoods";
import { getSchedules, upsertSchedule, deleteSchedule, getFriendsSchedules } from "@/lib/schedule";
import type { Schedule } from "@/lib/schedule";
import NaverMap from "@/components/NaverMap";
import { Copy, Check, LogOut, CalendarDays, Users, MapPin, Clock, Trash2, Pencil, X, Save, UtensilsCrossed, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface User { id: string; nickname: string; invite_code: string; }
interface FriendSchedule extends Schedule { profiles: { nickname: string }; }

function getWeekDates(baseDate: Date) {
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day + 6) % 7));
  return DAY_NAMES.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [friendSchedules, setFriendSchedules] = useState<FriendSchedule[]>([]);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [form, setForm] = useState({ neighborhood: "", start_time: "12:00", end_time: "13:00" });
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"schedule" | "friends">("schedule");
  const [weekOffset, setWeekOffset] = useState(0);
  const router = useRouter();

  const loadData = useCallback(async (u: User) => {
    const [mySchedules, fSchedules] = await Promise.all([
      getSchedules(u.id),
      getFriendsSchedules(u.id),
    ]);
    setSchedules(mySchedules);
    setFriendSchedules(fSchedules as FriendSchedule[]);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored) as User;
    setUser(u);
    loadData(u);
  }, [router, loadData]);

  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7;
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(baseDate);
  const isCurrentWeek = weekOffset === 0;

  async function handleSave(day: number) {
    if (!user || !form.neighborhood) return;
    await upsertSchedule({ user_id: user.id, day_of_week: day, neighborhood: form.neighborhood, start_time: form.start_time, end_time: form.end_time });
    setEditingDay(null);
    loadData(user);
  }

  async function handleDelete(day: number) {
    if (!user) return;
    await deleteSchedule(user.id, day);
    loadData(user);
  }

  function copyInviteLink() {
    if (!user) return;
    navigator.clipboard.writeText(`${window.location.origin}/invite/${user.invite_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const todayFriends = friendSchedules.filter((s) => s.day_of_week === todayDow);

  const mapMarkers = todayFriends.map((s) => {
    const hood = NEIGHBORHOODS.find((n) => n.id === s.neighborhood);
    return hood ? { lat: hood.lat, lng: hood.lng, label: `${s.profiles.nickname} (${hood.name})` } : null;
  }).filter(Boolean) as { lat: number; lng: number; label: string }[];

  const myToday = schedules.find((s) => s.day_of_week === todayDow);
  if (myToday && user) {
    const hood = NEIGHBORHOODS.find((n) => n.id === myToday.neighborhood);
    if (hood) mapMarkers.unshift({ lat: hood.lat, lng: hood.lng, label: `나 (${hood.name})` });
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="animate-gradient fixed inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-light/30" />
      <div className="animate-float fixed top-10 -right-32 h-64 w-64 rounded-full bg-brand-200/30 blur-3xl" />
      <div className="animate-float fixed -left-20 bottom-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-6">
        {/* Header */}
        <div className="animate-fade-in mb-6">
          <div className="glass-strong rounded-2xl p-4 shadow-lg shadow-black/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/20">
                  <UtensilsCrossed className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">점심먹자</h1>
                  <p className="text-xs text-gray-500">{user.nickname}님</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={copyInviteLink} className="btn-press flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-green-500/20 transition-all hover:shadow-lg">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "복사됨!" : "초대 링크"}
                </button>
                <button onClick={() => { localStorage.removeItem("user"); router.push("/"); }} className="btn-press flex items-center gap-1 rounded-xl bg-white/80 px-3 py-2 text-xs text-gray-500 ring-1 ring-gray-200 transition-all hover:bg-gray-100">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="animate-fade-in mb-4 flex gap-2" style={{ animationDelay: "0.1s" }}>
          <button onClick={() => setTab("schedule")} className={`btn-press flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${tab === "schedule" ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25" : "glass text-gray-500 hover:bg-white/80"}`}>
            <CalendarDays className="h-4 w-4" />
            내 스케줄
          </button>
          <button onClick={() => setTab("friends")} className={`btn-press flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${tab === "friends" ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25" : "glass text-gray-500 hover:bg-white/80"}`}>
            <Users className="h-4 w-4" />
            오늘 점심
            {todayFriends.length > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${tab === "friends" ? "bg-white/20" : "bg-accent text-white"}`}>
                {todayFriends.length}
              </span>
            )}
          </button>
        </div>

        {/* Schedule Tab */}
        {tab === "schedule" && (
          <div className="space-y-3">
            {/* Week Navigation */}
            <div className="glass-strong animate-fade-in rounded-xl p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <button onClick={() => setWeekOffset(weekOffset - 1)} className="btn-press rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{formatMonth(weekDates[0])}</p>
                  {!isCurrentWeek && (
                    <button onClick={() => setWeekOffset(0)} className="text-xs text-brand-600 hover:text-brand-700">오늘로</button>
                  )}
                </div>
                <button onClick={() => setWeekOffset(weekOffset + 1)} className="btn-press rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Mini Calendar Strip */}
              <div className="grid grid-cols-7 gap-1">
                {weekDates.map((date, i) => {
                  const sched = schedules.find((s) => s.day_of_week === i);
                  const isToday = isCurrentWeek && i === todayDow;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setForm({ neighborhood: sched?.neighborhood || "", start_time: sched?.start_time?.slice(0, 5) || "12:00", end_time: sched?.end_time?.slice(0, 5) || "13:00" });
                        setEditingDay(editingDay === i ? null : i);
                      }}
                      className={`btn-press flex flex-col items-center rounded-xl py-2 transition-all ${
                        isToday
                          ? "bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/20"
                          : editingDay === i
                            ? "bg-brand-50 ring-2 ring-brand-400/50"
                            : "hover:bg-gray-50"
                      }`}
                    >
                      <span className={`text-[10px] font-medium ${isToday ? "text-white/70" : "text-gray-400"}`}>{DAY_NAMES[i]}</span>
                      <span className={`text-lg font-bold ${isToday ? "text-white" : "text-gray-900"}`}>{date.getDate()}</span>
                      {sched && (
                        <div className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isToday ? "bg-white/80" : "bg-brand-400"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day Detail Cards */}
            {DAY_NAMES.map((name, i) => {
              const sched = schedules.find((s) => s.day_of_week === i);
              const isToday = isCurrentWeek && i === todayDow;
              const isEditing = editingDay === i;
              const date = weekDates[i];

              if (!isEditing && !sched && !isToday) return null;

              return (
                <div
                  key={i}
                  className={`animate-slide-up glass-strong rounded-xl p-3 shadow-sm transition-all ${isToday ? "ring-2 ring-brand-400/50 shadow-brand-500/10" : ""}`}
                  style={{ animationDelay: `${0.03 * i}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 flex-col items-center justify-center rounded-xl text-xs leading-tight ${isToday ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/20" : "bg-gray-100 text-gray-500"}`}>
                        <span className="text-[10px] font-medium opacity-70">{name}</span>
                        <span className="text-sm font-bold">{date.getDate()}</span>
                      </div>
                      {sched ? (
                        <div>
                          <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                            <MapPin className="h-3.5 w-3.5 text-brand-500" />
                            {NEIGHBORHOODS.find((n) => n.id === sched.neighborhood)?.name}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {sched.start_time.slice(0, 5)} - {sched.end_time.slice(0, 5)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-300">미설정</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          if (isEditing) { setEditingDay(null); return; }
                          setForm({ neighborhood: sched?.neighborhood || "", start_time: sched?.start_time?.slice(0, 5) || "12:00", end_time: sched?.end_time?.slice(0, 5) || "13:00" });
                          setEditingDay(i);
                        }}
                        className="btn-press rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                      >
                        {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                      </button>
                      {sched && (
                        <button onClick={() => handleDelete(i)} className="btn-press rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-3 animate-fade-in space-y-2 border-t border-gray-100 pt-3">
                      <select value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="w-full rounded-lg border-0 bg-gray-50 px-3 py-2.5 text-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                        <option value="">동네 선택</option>
                        {NEIGHBORHOODS.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                      </select>
                      <div className="flex items-center gap-2">
                        <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="flex-1 rounded-lg border-0 bg-gray-50 px-3 py-2.5 text-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                        <span className="text-gray-300">~</span>
                        <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="flex-1 rounded-lg border-0 bg-gray-50 px-3 py-2.5 text-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                      </div>
                      <button onClick={() => handleSave(i)} className="btn-press flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20">
                        <Save className="h-4 w-4" /> 저장
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Friends Tab */}
        {tab === "friends" && (
          <div className="animate-fade-in">
            {mapMarkers.length > 0 && (
              <div className="mb-4 overflow-hidden rounded-2xl shadow-lg">
                <NaverMap markers={mapMarkers} />
              </div>
            )}

            {todayFriends.length === 0 ? (
              <div className="glass-strong rounded-2xl py-12 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <Users className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">오늘 점심 가능한 친구가 없습니다</p>
                <p className="mt-1 text-xs text-gray-300">초대 링크를 공유해보세요!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayFriends.map((s, i) => {
                  const hood = NEIGHBORHOODS.find((n) => n.id === s.neighborhood);
                  const myTodaySched = schedules.find((ms) => ms.day_of_week === todayDow);
                  const overlaps = myTodaySched && s.start_time < myTodaySched.end_time && s.end_time > myTodaySched.start_time;
                  const sameHood = myTodaySched?.neighborhood === s.neighborhood;
                  const isMatch = sameHood && overlaps;

                  return (
                    <div
                      key={i}
                      className={`animate-slide-up glass-strong rounded-xl p-3.5 transition-all ${isMatch ? "ring-2 ring-green-400/50 shadow-green-500/10" : ""}`}
                      style={{ animationDelay: `${0.05 * i}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${isMatch ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md shadow-green-500/20" : "bg-gray-100 text-gray-500"}`}>
                            {s.profiles.nickname.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{s.profiles.nickname}</p>
                            <p className="flex items-center gap-1.5 text-xs text-gray-400">
                              <MapPin className="h-3 w-3" /> {hood?.name}
                              <Clock className="ml-1 h-3 w-3" /> {s.start_time.slice(0, 5)}-{s.end_time.slice(0, 5)}
                            </p>
                          </div>
                        </div>
                        {isMatch && (
                          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-md shadow-green-500/20">
                            <Sparkles className="h-3 w-3" /> 매칭!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
