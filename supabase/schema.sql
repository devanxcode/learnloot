-- ==============================================================================
-- LEARNLOOT SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY
-- Learn. Level Up. Get Rewarded.
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default 'Learner',
  email text,
  avatar_url text,
  tagline text default 'Conquering the syllabus, one session at a time',
  academic_target text default 'Top Rank & Conceptual Mastery',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. User Settings
create table if not exists public.user_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade unique not null,
  theme text default 'dark' not null,
  accent_color text default '#B8F36B' not null,
  dashboard_title text default 'Mission Control' not null,
  show_quote boolean default true not null,
  study_target_hours_per_day numeric default 4.0 not null,
  xp_per_study_session integer default 10 not null,
  xp_per_chapter integer default 50 not null,
  xp_per_task integer default 15 not null,
  xp_per_habit integer default 5 not null,
  coins_per_study_session integer default 2 not null,
  coins_per_chapter integer default 5 not null,
  coins_per_task integer default 1 not null,
  coin_rupee_ratio numeric default 10.0 not null, -- 10 coins = 1 Rupee
  min_redemption_coins integer default 50 not null,
  enabled_widgets jsonb default '["tasks", "quick_capture", "study_hours", "subject_progress", "chapters", "xp_level", "loot_coins", "habits", "deadlines", "recent_notes", "weekly_summary"]'::jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Subjects Table
create table if not exists public.subjects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  code text,
  color text default '#B8F36B' not null,
  icon text default 'BookOpen' not null,
  target_hours numeric default 50.0 not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Chapters Table
create table if not exists public.chapters (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references public.subjects on delete cascade not null,
  name text not null,
  chapter_number integer,
  status text default 'not_started' not null,
  priority text default 'medium' not null,
  target_date date,
  completion_date date,
  confidence_rating integer default 3 check (confidence_rating between 1 and 5),
  practice_questions_completed integer default 0,
  practice_questions_target integer default 50,
  notes_summary text,
  formula_sheet text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Projects Table
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  icon text default 'Folder' not null,
  cover_url text,
  status text default 'in_progress' not null,
  start_date date,
  target_date date,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tasks Table
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  status text default 'inbox' not null,
  priority text default 'medium' not null,
  subject_id uuid references public.subjects on delete set null,
  chapter_id uuid references public.chapters on delete set null,
  project_id uuid references public.projects on delete set null,
  due_date timestamp with time zone,
  completion_date timestamp with time zone,
  estimated_duration_mins integer default 45,
  actual_duration_mins integer,
  xp_reward integer default 15 not null,
  coin_reward integer default 1 not null,
  tags text[] default '{}',
  subtasks jsonb default '[]'::jsonb not null,
  notes text,
  recurring_rule text default 'none',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Manual Study Logs Table (CORE)
create table if not exists public.study_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  subject_id uuid references public.subjects on delete cascade not null,
  chapter_id uuid references public.chapters on delete set null,
  topic text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  study_method text default 'active_recall' not null,
  questions_solved integer default 0 not null,
  pages_reviewed integer default 0 not null,
  confidence_rating integer default 3 check (confidence_rating between 1 and 5),
  notes text,
  resource_url text,
  xp_awarded integer default 10 not null,
  coins_awarded integer default 2 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Planned Sessions Table
create table if not exists public.planned_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  start_time text,
  end_time text,
  subject_id uuid references public.subjects on delete cascade not null,
  chapter_id uuid references public.chapters on delete set null,
  title text not null,
  planned_duration_mins integer not null default 60,
  actual_duration_mins integer,
  completed boolean default false not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Habits & Habit Entries
create table if not exists public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  icon text default 'CheckCircle2' not null,
  color text default '#B8F36B' not null,
  active_days integer[] default '{0,1,2,3,4,5,6}' not null,
  category text default 'academic' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.habit_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  habit_id uuid references public.habits on delete cascade not null,
  date date not null default current_date,
  completed boolean default true not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (habit_id, date)
);

-- 10. Notes & Pages Table
create table if not exists public.pages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  parent_id uuid references public.pages on delete cascade,
  title text not null default 'Untitled',
  icon text default 'FileText' not null,
  cover_url text,
  subject_id uuid references public.subjects on delete set null,
  chapter_id uuid references public.chapters on delete set null,
  tags text[] default '{}',
  is_favorite boolean default false not null,
  content text default '' not null,
  template text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. XP Events (Double-award protected ledger)
create table if not exists public.xp_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  action_type text not null,
  reference_id text,
  xp_amount integer not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create unique index if not exists idx_xp_unique_ref on public.xp_events (user_id, reference_id) where reference_id is not null;

-- 12. Coin Ledger (Append-only immutable record)
create table if not exists public.coin_ledger (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('earned', 'pending', 'redeemed', 'reversed', 'adjusted')),
  amount integer not null,
  rupee_equivalent numeric not null,
  reference_id text,
  source text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create unique index if not exists idx_coins_unique_ref on public.coin_ledger (user_id, reference_id) where reference_id is not null and type = 'earned';

-- 13. Redemption Requests
create table if not exists public.redemption_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  coins_amount integer not null,
  rupee_amount numeric not null,
  payout_method text not null,
  payout_destination text not null,
  status text default 'pending' not null check (status in ('pending', 'approved', 'paid', 'rejected')),
  reference_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  processed_at timestamp with time zone
);

-- 14. Weekly Reviews
create table if not exists public.weekly_reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  week_start_date date not null,
  week_end_date date not null,
  planned_goals text default '',
  completed_goals text default '',
  biggest_difficulties text default '',
  mistakes_corrected text default '',
  what_worked text default '',
  what_needs_improvement text default '',
  next_week_priorities text default '',
  total_study_minutes integer default 0,
  tasks_completed_count integer default 0,
  chapters_completed_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, week_start_date)
);

-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.study_logs enable row level security;
alter table public.planned_sessions enable row level security;
alter table public.habits enable row level security;
alter table public.habit_entries enable row level security;
alter table public.pages enable row level security;
alter table public.xp_events enable row level security;
alter table public.coin_ledger enable row level security;
alter table public.redemption_requests enable row level security;
alter table public.weekly_reviews enable row level security;

-- Basic user owns all records policy
create policy "Users own profiles" on public.profiles for all using (auth.uid() = id);
create policy "Users own settings" on public.user_settings for all using (auth.uid() = user_id);
create policy "Users own subjects" on public.subjects for all using (auth.uid() = user_id);
create policy "Users own chapters" on public.chapters for all using (auth.uid() = user_id);
create policy "Users own projects" on public.projects for all using (auth.uid() = user_id);
create policy "Users own tasks" on public.tasks for all using (auth.uid() = user_id);
create policy "Users own study_logs" on public.study_logs for all using (auth.uid() = user_id);
create policy "Users own planned_sessions" on public.planned_sessions for all using (auth.uid() = user_id);
create policy "Users own habits" on public.habits for all using (auth.uid() = user_id);
create policy "Users own habit_entries" on public.habit_entries for all using (auth.uid() = user_id);
create policy "Users own pages" on public.pages for all using (auth.uid() = user_id);
create policy "Users own xp_events" on public.xp_events for all using (auth.uid() = user_id);
create policy "Users own coin_ledger" on public.coin_ledger for all using (auth.uid() = user_id);
create policy "Users own redemption_requests" on public.redemption_requests for all using (auth.uid() = user_id);
create policy "Users own weekly_reviews" on public.weekly_reviews for all using (auth.uid() = user_id);
