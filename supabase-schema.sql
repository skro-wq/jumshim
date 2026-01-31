-- 점심먹자 DB 스키마
-- Supabase SQL Editor에서 실행
-- ⚠️ 기존 테이블이 있다면 먼저: drop table if exists friendships, schedules, profiles cascade;

-- 사용자 테이블
create table profiles (
  id uuid default gen_random_uuid() primary key,
  nickname text not null,
  password_hash text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

-- 스케줄 테이블
create table schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  day_of_week int not null check (day_of_week >= 0 and day_of_week <= 6),
  neighborhood text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz default now(),
  unique(user_id, day_of_week)
);

-- 친구 관계 테이블
create table friendships (
  user_id uuid references profiles(id) on delete cascade,
  friend_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, friend_id)
);

-- 인덱스
create index idx_schedules_user on schedules(user_id);
create index idx_schedules_day on schedules(day_of_week);
create index idx_friendships_user on friendships(user_id);
create index idx_friendships_friend on friendships(friend_id);
create index idx_profiles_invite on profiles(invite_code);

-- RLS
alter table profiles enable row level security;
alter table schedules enable row level security;
alter table friendships enable row level security;

create policy "Allow all" on profiles for all using (true) with check (true);
create policy "Allow all" on schedules for all using (true) with check (true);
create policy "Allow all" on friendships for all using (true) with check (true);
