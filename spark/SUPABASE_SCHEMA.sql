-- ============================================================
-- Spark – Supabase Schema
-- Run this entire file in your Supabase SQL editor once.
-- ============================================================

-- ── Enable UUID extension (usually already on) ─────────────
create extension if not exists "uuid-ossp";

-- ── profiles ───────────────────────────────────────────────
-- One row per user; id mirrors auth.users.id
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  handle         text unique not null,        -- @zara_k  (no @)
  display_name   text not null,
  avatar_emoji   text not null default '😊',
  skill_focus    text,
  streak         int  not null default 0,
  total_points   int  not null default 0,
  invite_code    text unique not null,
  shields        int  not null default 0,
  created_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read all profiles" on public.profiles;
create policy "Users can read all profiles"
  on public.profiles for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ── challenges ─────────────────────────────────────────────
-- One row per daily challenge
create table if not exists public.challenges (
  id               uuid primary key default uuid_generate_v4(),
  date             date unique not null,
  title            text not null,
  skill_category   text not null,          -- e.g. "Finger Drumming"
  prompt           text not null,
  difficulty       text not null default 'Medium',
  time_limit_secs  int  not null default 60,
  created_at       timestamptz not null default now()
);

alter table public.challenges enable row level security;

drop policy if exists "Anyone can read challenges" on public.challenges;
create policy "Anyone can read challenges"
  on public.challenges for select using (true);

-- Seed today's challenge so the app works immediately
insert into public.challenges (date, title, skill_category, prompt, difficulty, time_limit_secs)
values (current_date, 'Ghost Notes & Dynamics', 'Finger Drumming',
        'Play a 4/4 groove with ghost notes on the snare. Keep ghost notes at 30% velocity — control is everything.',
        'Medium', 60)
on conflict (date) do nothing;

-- ── attempts ───────────────────────────────────────────────
-- One attempt per user per challenge (upsert on conflict)
create table if not exists public.attempts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  result        text not null check (result in ('nailed','almost','failed')),
  points_earned int  not null default 0,
  duration_ms   int,                        -- ms taken (null if failed/timed-out)
  created_at    timestamptz not null default now(),
  unique (user_id, challenge_id)
);

alter table public.attempts enable row level security;

drop policy if exists "Users can read all attempts" on public.attempts;
create policy "Users can read all attempts"
  on public.attempts for select using (true);

drop policy if exists "Users can insert own attempts" on public.attempts;
create policy "Users can insert own attempts"
  on public.attempts for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own attempts" on public.attempts;
create policy "Users can update own attempts"
  on public.attempts for update using (auth.uid() = user_id);

-- ── friendships ────────────────────────────────────────────
-- status: 'pending' | 'accepted'
create table if not exists public.friendships (
  id           uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending','accepted')),
  created_at   timestamptz not null default now(),
  unique (requester_id, addressee_id)
);

alter table public.friendships enable row level security;

drop policy if exists "Users can see their own friendships" on public.friendships;
create policy "Users can see their own friendships"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "Users can send friend requests" on public.friendships;
create policy "Users can send friend requests"
  on public.friendships for insert with check (auth.uid() = requester_id);

drop policy if exists "Addressee can accept requests" on public.friendships;
create policy "Addressee can accept requests"
  on public.friendships for update using (auth.uid() = addressee_id);

-- ── Trigger: keep profiles.streak / total_points in sync ───
-- (Optional but handy — updates the profile denormalised totals
--  whenever a new attempt is inserted or updated.)

create or replace function public.sync_profile_stats()
returns trigger language plpgsql security definer as $$
declare
  today_date date := current_date;
  yesterday_date date := current_date - 1;
  had_yesterday bool;
  new_streak int;
begin
  -- Recalculate total_points
  update public.profiles p
  set total_points = (
    select coalesce(sum(points_earned), 0)
    from public.attempts
    where user_id = new.user_id
  )
  where p.id = new.user_id;

  -- Recalculate streak: count consecutive days with an attempt ending today
  select exists (
    select 1 from public.attempts a
    join public.challenges c on c.id = a.challenge_id
    where a.user_id = new.user_id
      and c.date = yesterday_date
      and a.result <> 'failed'
  ) into had_yesterday;

  if had_yesterday then
    update public.profiles
    set streak = streak + 1
    where id = new.user_id
      and not exists (
        -- Don't double-increment if already counted today
        select 1 from public.attempts a2
        join public.challenges c2 on c2.id = a2.challenge_id
        where a2.user_id = new.user_id
          and c2.date = today_date
          and a2.id <> new.id
      );
  else
    -- First attempt or streak broken: reset to 1 if today's attempt is not failed
    if new.result <> 'failed' then
      update public.profiles
      set streak = greatest(streak, 1)
      where id = new.user_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_attempt_upsert on public.attempts;
create trigger on_attempt_upsert
  after insert or update on public.attempts
  for each row execute procedure public.sync_profile_stats();
