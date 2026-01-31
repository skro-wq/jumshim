import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

export async function signUp(nickname: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const inviteCode = generateInviteCode();

  const { data, error } = await supabase
    .from("profiles")
    .insert({ nickname, password_hash: passwordHash, invite_code: inviteCode })
    .select()
    .single();

  if (error) throw new Error(`가입 실패: ${error.message}`);
  return data;
}

export async function signIn(nickname: string, password: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("nickname", nickname)
    .single();

  if (error || !data) throw new Error("닉네임을 찾을 수 없습니다");

  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) throw new Error("비밀번호가 틀렸습니다");

  return data;
}

export async function getUserByInviteCode(code: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("invite_code", code)
    .single();

  if (error) throw error;
  return data;
}

export async function addFriend(userId: string, friendId: string) {
  // 양방향 친구 추가
  const { error } = await supabase.from("friendships").insert([
    { user_id: userId, friend_id: friendId },
    { user_id: friendId, friend_id: userId },
  ]);
  if (error && !error.message.includes("duplicate")) throw error;
}
