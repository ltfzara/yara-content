-- Yara initial schema
-- Run this in the Supabase SQL Editor for project xbunhfdwcdjszfxgehex.

create extension if not exists pgcrypto;

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text,
  instagram_handle text,
  business_type text,
  products_services text,
  target_audience text,
  audience_desired_result text,
  business_differentiator text,
  content_goal text,
  brand_voice text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.business_profiles(id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.content_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.business_profiles(id) on delete set null,
  title text not null default 'پیش‌نویس بدون عنوان',
  content_type text not null default 'idea'
    check (content_type in ('idea', 'reel_script', 'caption', 'story', 'carousel')),
  objective text,
  hook text,
  body text,
  call_to_action text,
  status text not null default 'draft'
    check (status in ('draft', 'planned', 'published', 'archived')),
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at desc);
create index if not exists content_drafts_user_updated_idx
  on public.content_drafts (user_id, updated_at desc);

alter table public.business_profiles enable row level security;
alter table public.chat_messages enable row level security;
alter table public.content_drafts enable row level security;

drop policy if exists "Users manage their own business profile" on public.business_profiles;
create policy "Users manage their own business profile"
  on public.business_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own chat messages" on public.chat_messages;
create policy "Users manage their own chat messages"
  on public.chat_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own content drafts" on public.content_drafts;
create policy "Users manage their own content drafts"
  on public.content_drafts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
