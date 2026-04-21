-- ============================================================
-- GIA Aircraft Log Management System — Supabase SQL Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. PROFILES TABLE (extends Supabase auth.users) ──────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text not null,
  username    text unique not null,
  role        text not null check (role in ('admin', 'supervisor', 'staff')),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies: users can read all profiles, only update their own
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ── 2. AIRCRAFT_LOGS TABLE ────────────────────────────────────
create table if not exists public.aircraft_logs (
  id              text primary key,
  actype          text,
  reg             text,
  flt             text not null,
  date            date,
  sta             text,
  ata             text,
  std             text,
  atd             text,
  sgt             integer default 0,
  agt             integer default 0,
  dest            text,
  hcn             text,
  arr_pax         integer[] default '{0,0,0,0}',
  dep_pax         integer[] default '{0,0,0,0}',
  trn_pax         integer[] default '{0,0,0,0}',
  tot_arr         integer default 0,
  tot_dep         integer default 0,
  tot_trn         integer default 0,
  frtin           integer default 0,
  frtout          integer default 0,
  trnfrt          integer default 0,
  mlsin           integer default 0,
  mlsout          integer default 0,
  trnmls          text default 'NIL',
  shift           text check (shift in ('A','B','C')),
  remarks         text,
  logged_by       uuid references auth.users(id),
  logged_by_name  text,
  logged_by_role  text,
  created_at      timestamptz not null default now()
);

alter table public.aircraft_logs enable row level security;

-- All authenticated users can view logs
create policy "Logs viewable by authenticated users"
  on public.aircraft_logs for select
  using (auth.role() = 'authenticated');

-- All authenticated users can insert logs
create policy "Authenticated users can insert logs"
  on public.aircraft_logs for insert
  with check (auth.role() = 'authenticated');

-- ONLY admins can delete logs
create policy "Only admins can delete logs"
  on public.aircraft_logs for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- No one can update a submitted log (immutable after submission)
-- (no update policy = no updates allowed)


-- ── 3. AUDIT_TRAIL TABLE ─────────────────────────────────────
create table if not exists public.audit_trail (
  id          bigserial primary key,
  ts          timestamptz not null default now(),
  user_id     uuid references auth.users(id),
  username    text,
  full_name   text,
  action      text not null,
  detail      text,
  event_type  text check (event_type in ('create','delete','login','logout','update','error'))
);

alter table public.audit_trail enable row level security;

-- Admins and supervisors can view audit trail
create policy "Admins and supervisors can view audit trail"
  on public.audit_trail for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','supervisor')
    )
  );

-- All authenticated users can insert audit records
create policy "Authenticated users can insert audit records"
  on public.audit_trail for insert
  with check (auth.role() = 'authenticated');

-- Only admins can delete audit records
create policy "Only admins can delete audit records"
  on public.audit_trail for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ── 4. AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'username', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 5. SEED INITIAL ADMIN (optional — use Supabase Auth UI instead) ──
-- After creating users via Supabase Auth dashboard, you can manually
-- set roles by running:
--   update public.profiles set role = 'admin' where username = 'your_username';

-- ── 6. SEED SAMPLE LOG ────────────────────────────────────────
-- (Run after creating your first admin user and getting their UUID)
-- insert into public.aircraft_logs (id, actype, reg, flt, date, sta, ata, std, atd,
--   sgt, agt, dest, hcn, arr_pax, dep_pax, trn_pax, tot_arr, tot_dep, tot_trn,
--   frtin, frtout, trnfrt, mlsin, mlsout, trnmls, shift, logged_by_name, logged_by_role)
-- values (
--   'LOG-001','A330','TC-LNG','TK571','2024-02-21','05:45','05:52','07:15','07:17',
--   90,62,'IST','54424','{150,56,13,3}','{100,80,5,64}','{20,4,1,0}',
--   222,249,25,1095,0,2220,1,1,'NIL','B','System Administrator','admin'
-- );
