-- Athlete Intake schema

create extension if not exists "pgcrypto";

create table if not exists athletes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  email text not null unique,
  phone text,
  date_of_birth date,
  sport text,
  position text,
  level text,
  height_cm numeric,
  weight_kg numeric,
  notes text
);

create table if not exists intake_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  athlete_id uuid references athletes(id) on delete cascade,
  responses jsonb not null,
  status text not null default 'pending'
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submission_id uuid not null references intake_submissions(id) on delete cascade,
  athlete_id uuid references athletes(id) on delete cascade,
  model text not null,
  summary text,
  recommendations jsonb,
  raw jsonb
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  athlete_id uuid references athletes(id) on delete cascade,
  channel text not null,
  recipient text not null,
  subject text,
  body text,
  status text not null default 'queued',
  sent_at timestamptz,
  error text
);

create index if not exists idx_intake_submissions_athlete on intake_submissions(athlete_id);
create index if not exists idx_analyses_submission on analyses(submission_id);
create index if not exists idx_analyses_athlete on analyses(athlete_id);
create index if not exists idx_notifications_athlete on notifications(athlete_id);

alter table athletes enable row level security;
alter table intake_submissions enable row level security;
alter table analyses enable row level security;
alter table notifications enable row level security;
