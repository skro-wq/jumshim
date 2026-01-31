import { supabase } from "./supabase";

export interface Schedule {
  id?: string;
  user_id: string;
  day_of_week: number;
  neighborhood: string;
  start_time: string;
  end_time: string;
}

export async function getSchedules(userId: string) {
  const { data, error } = await supabase
    .from("schedules")
    .select()
    .eq("user_id", userId)
    .order("day_of_week");
  if (error) throw error;
  return data as Schedule[];
}

export async function upsertSchedule(schedule: Omit<Schedule, "id">) {
  const { data, error } = await supabase
    .from("schedules")
    .upsert(schedule, { onConflict: "user_id,day_of_week" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSchedule(userId: string, dayOfWeek: number) {
  const { error } = await supabase
    .from("schedules")
    .delete()
    .eq("user_id", userId)
    .eq("day_of_week", dayOfWeek);
  if (error) throw error;
}

export async function getFriendsSchedules(userId: string) {
  // 친구 ID 목록 가져오기
  const { data: friends, error: fErr } = await supabase
    .from("friendships")
    .select("friend_id")
    .eq("user_id", userId);
  if (fErr) throw fErr;

  if (!friends || friends.length === 0) return [];

  const friendIds = friends.map((f) => f.friend_id);

  // 친구들의 스케줄 + 닉네임
  const { data, error } = await supabase
    .from("schedules")
    .select("*, profiles!inner(nickname)")
    .in("user_id", friendIds);
  if (error) throw error;
  return data;
}
