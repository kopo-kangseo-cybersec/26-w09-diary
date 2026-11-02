create table if not exists public.diaries (
  id bigint primary key generated always as identity,
  content text not null,
  emotion text not null check (emotion in ('joy', 'calm', 'sad', 'angry', 'anxious')),
  created_at timestamptz not null default now()
);

alter table public.diaries
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.diaries
  alter column user_id set default auth.uid();

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin'))
);

alter table public.profiles enable row level security;
alter table public.diaries enable row level security;

create or replace function public.is_diary_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_diary_admin() from public, anon;
grant execute on function public.is_diary_admin() to authenticated;

create or replace function public.create_diary_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_diary_profile_after_signup on auth.users;
create trigger create_diary_profile_after_signup
  after insert on auth.users
  for each row execute function public.create_diary_profile();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

revoke all on public.diaries from public, anon, authenticated;
grant select, insert, delete on public.diaries to authenticated;
revoke all on sequence public.diaries_id_seq from public, anon, authenticated;
grant usage, select on sequence public.diaries_id_seq to authenticated;

revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('diaries', 'profiles')
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      existing_policy.policyname,
      existing_policy.tablename
    );
  end loop;
end;
$$;

create policy "users read own diaries and admins read all"
  on public.diaries for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_diary_admin()));

create policy "users create own diaries"
  on public.diaries for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "users delete own diaries and admins delete all"
  on public.diaries for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_diary_admin()));

create policy "users read own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));
